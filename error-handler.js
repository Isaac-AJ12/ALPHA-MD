process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process alive instead of crashing
  if (reason === 1006) {
    console.log('WebSocket connection closed abnormally (1006). Attempting to reconnect...');
  }
});

// Add a periodic health check for the WhatsApp connection
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function setupReconnectLogic(startBot) {
  // If the bot disconnects, try to reconnect
  global.reconnectWhatsApp = async () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect WhatsApp (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      
      try {
        await startBot();
        reconnectAttempts = 0; // Reset counter on successful reconnection
        console.log('WhatsApp reconnected successfully!');
      } catch (error) {
        console.error('Failed to reconnect WhatsApp:', error);
        
        // Try again after a delay with exponential backoff
        const delay = Math.min(30000, 5000 * Math.pow(2, reconnectAttempts));
        console.log(`Will try again in ${delay/1000} seconds...`);
        setTimeout(global.reconnectWhatsApp, delay);
      }
    } else {
      console.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Please restart the service manually.`);
    }
  };
}



process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Prevent the process from crashing on connection errors
  if (err.message && (err.message.includes('Connection Closed') || 
                      err.message.includes('connectionClosed'))) {
    console.log('WhatsApp connection issue detected. The service will continue running.');
  }
});


module.exports = { setupReconnectLogic };