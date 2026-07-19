import http.server
import json
import os
import sys
import base64
import mimetypes
import io
import subprocess
from urllib.parse import urlparse
from datetime import datetime
from PIL import Image

PORT = 8765
PRODUCTS_FILE = "products.json"
CAROUSEL_FILE = "imagens.json"
IMAGENS_DIR = "imagens"

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.lower()
        if path.endswith(('.mp4', '.webm', '.mov', '.m4v')):
            self.send_header('Cache-Control', 'public, max-age=2592000')
            self.send_header('Accept-Ranges', 'bytes')
        elif path.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            self.send_header('Cache-Control', 'public, max-age=2592000')
        super().end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/get-carousel":
            self._handle_get_carousel()
        else:
            super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path

        if path == "/api/save-products":
            self._handle_save_json(PRODUCTS_FILE)
        elif path == "/api/save-carousel":
            self._handle_save_json(CAROUSEL_FILE)
        elif path == "/api/get-carousel":
            self._handle_get_carousel()
        elif path == "/api/upload":
            self._handle_upload()
        elif path == "/api/delete-file":
            self._handle_delete_file()
        elif path == "/api/deploy":
            self._handle_deploy()
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return self.rfile.read(length)

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def _handle_save_json(self, filepath):
        try:
            body = self._read_body()
            data = json.loads(body)
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            self._send_json({"ok": True})
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _handle_get_carousel(self):
        try:
            if os.path.exists(CAROUSEL_FILE):
                with open(CAROUSEL_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
            else:
                data = []
            self._send_json(data)
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _handle_upload(self):
        try:
            os.makedirs(IMAGENS_DIR, exist_ok=True)
            body = self._read_body()
            payload = json.loads(body)
            filename = payload.get("filename", "arquivo.bin")
            file_data = payload.get("data", "")
            media_type = payload.get("type", "image")

            if not file_data:
                self._send_json({"error": "Dados vazios"}, 400)
                return

            name, ext = os.path.splitext(filename)
            ext = ext.lower()
            if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".mov"):
                ext = ".jpg"
            safe_name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{base64.urlsafe_b64encode(os.urandom(3)).decode()}{ext}"
            filepath = os.path.join(IMAGENS_DIR, safe_name)

            if "," in file_data:
                file_data = file_data.split(",", 1)[1]
            raw = base64.b64decode(file_data)

            # Resize images to carousel-friendly size
            if media_type == "image" and ext in (".jpg", ".jpeg", ".png", ".webp"):
                try:
                    img = Image.open(io.BytesIO(raw))
                    img = img.convert("RGB")
                    max_w, max_h = 400, 600
                    img.thumbnail((max_w, max_h), Image.Lanczos)
                    out = io.BytesIO()
                    img.save(out, "WEBP", quality=82, optimize=True)
                    raw = out.getvalue()
                    filepath = filepath.rsplit(".", 1)[0] + ".webp"
                except Exception:
                    pass

            # Compress videos for mobile
            if media_type == "video" and ext in (".mp4", ".webm", ".mov"):
                try:
                    temp_in = filepath + ".tmp"
                    with open(temp_in, "wb") as f:
                        f.write(raw)

                    final_path = filepath.rsplit(".", 1)[0] + ".mp4"
                    cmd = [
                        "ffmpeg", "-i", temp_in,
                        "-c:v", "libx264", "-preset", "fast",
                        "-crf", "28", "-maxrate", "1500k", "-bufsize", "2000k",
                        "-c:a", "aac", "-b:a", "96k",
                        "-y", final_path
                    ]
                    subprocess.run(cmd, capture_output=True, timeout=30)

                    if os.path.exists(final_path):
                        os.remove(temp_in)
                        filepath = final_path
                    else:
                        os.remove(temp_in)
                except Exception as e:
                    print(f"Video compression failed: {e}, using original")
                    with open(filepath, "wb") as f:
                        f.write(raw)
            else:
                with open(filepath, "wb") as f:
                    f.write(raw)

            self._send_json({"ok": True, "path": filepath.replace("\\", "/")})
        except Exception as e:
            print(f"Upload error: {e}")
            import traceback
            traceback.print_exc()
            self._send_json({"error": str(e)}, 500)

    def _handle_delete_file(self):
        try:
            body = self._read_body()
            payload = json.loads(body)
            filepath = payload.get("path", "")
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
            self._send_json({"ok": True})
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _handle_deploy(self):
        try:
            result = subprocess.run(
                ["vercel", "--prod", "--yes"],
                capture_output=True, text=True, timeout=120,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            full_out = (result.stdout + result.stderr).strip()
            print(f"[DEPLOY] {full_out}")
            url = ""
            for line in full_out.splitlines():
                if "https://" in line and ".vercel.app" in line:
                    parts = line.strip().split()
                    for p in parts:
                        if p.startswith("https://") and ".vercel.app" in p:
                            url = p
                            break
                    if url:
                        break
            self._send_json({"ok": True, "url": url})
        except subprocess.TimeoutExpired:
            print("[DEPLOY] Timeout")
            self._send_json({"error": "timeout"}, 500)
        except Exception as e:
            print(f"[DEPLOY] Error: {e}")
            self._send_json({"error": str(e)}, 500)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    os.makedirs(IMAGENS_DIR, exist_ok=True)
    server = http.server.HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Servidor rodando em http://localhost:{PORT}")
    server.serve_forever()
