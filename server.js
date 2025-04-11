require('./error-handler');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { setupReconnectLogic } = require('./error-handler');
const { cleanupSessions } = require('./cleanup-sessions');

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

// Function to start the bot
const startBot = async () => {
  try {
    // Check if we should skip WhatsApp connection during deployment
    if (process.env.SKIP_WA_CONNECTION === 'true' && process.env.NODE_ENV === 'production') {
      console.log('Skipping WhatsApp connection during deployment as configured');
      return;
    }
    
    // Clean up session files before starting
    cleanupSessions();
    
    // Clear require cache for index.js to ensure fresh start
    delete require.cache[require.resolve('./index.js')];
    
    // Import the bot code
    await require('./index.js');
    console.log('Bot started successfully');
  } catch (error) {
    console.error('Error starting bot:', error);
    throw error; // Rethrow to allow reconnect logic to handle it
  }
};

// Setup reconnection logic
setupReconnectLogic(startBot);

// Delay bot startup to ensure server is ready first
setTimeout(() => {
  startBot().catch(err => {
    console.error('Initial bot startup failed:', err);
    // Initial reconnect will be handled by error handlers
  });
}, 10000); // 10 second delay

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Clear any reconnect timers
  if (global.reconnectTimer) {
    clearTimeout(global.reconnectTimer);
  }
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
