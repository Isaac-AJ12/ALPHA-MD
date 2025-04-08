require('./error-handler');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('ALPHA-MD Bot Server is running!');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Try to start the bot, but don't let it crash the server
try {
  // Import the bot code
  require('./index.js');
} catch (error) {
  console.error('Error starting bot:', error);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
