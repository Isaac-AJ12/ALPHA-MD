require('./error-handler');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('ALPHA-MD Bot Server is running!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Delay bot startup to ensure server is ready first
setTimeout(() => {
  // Try to start the bot, but don't let it crash the server
  try {
    // Check if we should skip WhatsApp connection during deployment
    if (process.env.SKIP_WA_CONNECTION === 'true' && process.env.NODE_ENV === 'production') {
      console.log('Skipping WhatsApp connection during deployment as configured');
    } else {
      // Import the bot code
      require('./index.js');
    }
  } catch (error) {
    console.error('Error starting bot:', error);
  }
}, 5000); // 5 second delay

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
