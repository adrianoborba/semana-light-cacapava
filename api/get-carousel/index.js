const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const CAROUSEL_FILE = path.join(process.cwd(), 'imagens.json');
    if (fs.existsSync(CAROUSEL_FILE)) {
      const data = fs.readFileSync(CAROUSEL_FILE, 'utf-8');
      res.status(200).json(JSON.parse(data));
    } else {
      res.status(200).json([]);
    }
  } catch (err) {
    console.error('Get carousel error:', err);
    res.status(500).json({ error: err.message });
  }
};
