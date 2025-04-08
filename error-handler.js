process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process alive instead of crashing
  if (reason === 1006) {
    console.log('WebSocket connection closed abnormally (1006). This is expected when running in a headless environment without authentication.');
  }
});
