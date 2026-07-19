const fs = require('fs');
const path = require('path');

function generateSafeName(original) {
  const now = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = path.extname(original) || '.webp';
  return `${now}_${random}${ext}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const IMAGENS_DIR = path.join(process.cwd(), 'imagens');
    if (!fs.existsSync(IMAGENS_DIR)) {
      fs.mkdirSync(IMAGENS_DIR, { recursive: true });
    }

    const { filename, data, type } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const safeName = generateSafeName(filename || 'arquivo.bin');
    const filepath = path.join(IMAGENS_DIR, safeName);

    let fileData = data;
    if (fileData.includes(',')) {
      fileData = fileData.split(',')[1];
    }

    const buffer = Buffer.from(fileData, 'base64');
    fs.writeFileSync(filepath, buffer);

    const publicPath = `/imagens/${safeName}`;
    res.status(200).json({ ok: true, path: publicPath });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};
