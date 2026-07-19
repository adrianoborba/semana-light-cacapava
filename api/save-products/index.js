const fs = require('fs');
const path = require('path');

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
    const PRODUCTS_FILE = path.join(process.cwd(), 'products.json');
    const data = req.body;
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: err.message });
  }
};
