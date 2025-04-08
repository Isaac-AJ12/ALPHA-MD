const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('ALPHA-MD Bot Server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start the bot in the background
require('./index.js');
