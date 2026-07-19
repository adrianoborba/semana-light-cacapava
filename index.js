const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

const PRODUCTS_FILE = 'products.json';
const CAROUSEL_FILE = 'imagens.json';
const IMAGENS_DIR = 'imagens';

// Ensure imagens directory exists
if (!fs.existsSync(IMAGENS_DIR)) {
  fs.mkdirSync(IMAGENS_DIR, { recursive: true });
}

// API Routes
app.post('/api/save-products', (req, res) => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/get-carousel', (req, res) => {
  try {
    if (fs.existsSync(CAROUSEL_FILE)) {
      const data = fs.readFileSync(CAROUSEL_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save-carousel', (req, res) => {
  try {
    fs.writeFileSync(CAROUSEL_FILE, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', (req, res) => {
  try {
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
    res.json({ ok: true, path: publicPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/deploy', (req, res) => {
  try {
    const url = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://semana-light-cacapava.vercel.app';

    res.json({
      ok: true,
      url: url,
      message: 'Files saved successfully! The deployment will refresh automatically.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

// Export for Vercel
module.exports = app;

// Run locally if not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
