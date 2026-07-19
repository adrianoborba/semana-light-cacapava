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
    // On Vercel, deployments are automatic when you push changes
    // Get the current deployment URL from environment variables
    const url = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://semana-light-cacapava.vercel.app';

    res.status(200).json({
      ok: true,
      url: url,
      message: 'Files saved successfully! The deployment will refresh automatically.'
    });
  } catch (err) {
    console.error('Deploy error:', err);
    res.status(500).json({ error: err.message });
  }
};
