process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process alive instead of crashing
  if (reason && reason.statusCode === 1006 || 
      (reason.message && reason.message.includes('Connection Closed'))) {
    console.log('Connection issue detected. This is expected during deployment or in headless environments.');
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Prevent the process from crashing on connection errors
  if (err.message && (err.message.includes('Connection Closed') || 
                      err.message.includes('connectionClosed'))) {
    console.log('WhatsApp connection issue detected. The service will continue running.');
  }
});

