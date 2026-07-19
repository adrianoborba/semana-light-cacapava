const fs = require('fs');
const path = require('path');
const { URL } = require('url');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace('/api', '');

  try {
    if (pathname === '/save-products' && req.method === 'POST') {
      const PRODUCTS_FILE = path.join(process.cwd(), 'products.json');
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(req.body, null, 2));
      return res.status(200).json({ ok: true });
    }

    if (pathname === '/get-carousel' && req.method === 'GET') {
      const CAROUSEL_FILE = path.join(process.cwd(), 'imagens.json');
      if (fs.existsSync(CAROUSEL_FILE)) {
        const data = fs.readFileSync(CAROUSEL_FILE, 'utf-8');
        return res.status(200).json(JSON.parse(data));
      } else {
        return res.status(200).json([]);
      }
    }

    if (pathname === '/save-carousel' && req.method === 'POST') {
      const CAROUSEL_FILE = path.join(process.cwd(), 'imagens.json');
      fs.writeFileSync(CAROUSEL_FILE, JSON.stringify(req.body, null, 2));
      return res.status(200).json({ ok: true });
    }

    if (pathname === '/upload' && req.method === 'POST') {
      const IMAGENS_DIR = path.join(process.cwd(), 'imagens');
      if (!fs.existsSync(IMAGENS_DIR)) {
        fs.mkdirSync(IMAGENS_DIR, { recursive: true });
      }

      const { filename, data } = req.body;
      if (!data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      const now = Date.now();
      const random = Math.random().toString(36).substring(7);
      const ext = path.extname(filename) || '.webp';
      const safeName = `${now}_${random}${ext}`;
      const filepath = path.join(IMAGENS_DIR, safeName);

      let fileData = data;
      if (fileData.includes(',')) {
        fileData = fileData.split(',')[1];
      }

      const buffer = Buffer.from(fileData, 'base64');
      fs.writeFileSync(filepath, buffer);

      const publicPath = `/imagens/${safeName}`;
      return res.status(200).json({ ok: true, path: publicPath });
    }

    if (pathname === '/deploy' && req.method === 'POST') {
      const url = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://semana-light-cacapava.vercel.app';

      return res.status(200).json({
        ok: true,
        url: url,
        message: 'Files saved successfully!'
      });
    }

    res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
};
