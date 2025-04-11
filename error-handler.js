process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Handle WebSocket connection closed abnormally (1006)
  if (reason === 1006) {
    console.log('WebSocket connection closed abnormally (1006). Waiting before reconnecting...');
    // Don't try to reconnect immediately - let the reconnect logic handle it
  }
  
  // Handle "Connection replaced" errors
  if (reason && reason.message && reason.message.includes('Connection replaced')) {
    console.log('Session conflict detected. Waiting for old session to expire...');
    // Add a longer delay for session conflicts
    setTimeout(() => {
      if (global.reconnectWhatsApp) {
        global.reconnectWhatsApp();
      }
    }, 30000); // 30 second delay for session conflicts
  }
});

// Add a periodic health check for the WhatsApp connection
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectTimer = null;

function setupReconnectLogic(startBot) {
  // If the bot disconnects, try to reconnect
  global.reconnectWhatsApp = async () => {
    // Clear any existing reconnect timers
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect WhatsApp (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      
      try {
        // Add a delay before reconnecting to allow previous connections to close
        await new Promise(resolve => setTimeout(resolve, 10000));
        await startBot();
        reconnectAttempts = 0; // Reset counter on successful reconnection
        console.log('WhatsApp reconnected successfully!');
      } catch (error) {
        console.error('Failed to reconnect WhatsApp:', error);
        
        // Try again after a delay with exponential backoff
        const delay = Math.min(60000, 10000 * Math.pow(2, reconnectAttempts));
        console.log(`Will try again in ${delay/1000} seconds...`);
        
        reconnectTimer = setTimeout(global.reconnectWhatsApp, delay);
      }
    } else {
      console.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Will try again after a longer delay.`);
      // Reset counter and try again after a longer delay instead of giving up
      reconnectAttempts = 0;
      reconnectTimer = setTimeout(global.reconnectWhatsApp, 120000); // 2 minutes
    }
  };
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  
  // Handle specific connection errors
  if (err.message) {
    if (err.message.includes('Connection Closed') || 
        err.message.includes('connectionClosed') ||
        err.message.includes('Connection replaced')) {
      console.log('WhatsApp connection issue detected. Will attempt to reconnect...');
      
      // Delay reconnection attempt to allow previous connection to fully close
      setTimeout(() => {
        if (global.reconnectWhatsApp) {
          global.reconnectWhatsApp();
        }
      }, 15000); // 15 second delay
    }
  }
});

module.exports = { setupReconnectLogic };
