try {
  console.log('Vercel API Entry: Loading backend...');
  const app = require('../backend/server');
  console.log('Vercel API Entry: Backend loaded successfully.');
  module.exports = app;
} catch (error) {
  console.error('Vercel API Entry Error: Failed to load backend module:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Backend failed to load during Vercel initialization',
      details: error.message,
      stack: error.stack
    });
  };
}
