const express = require('express');
const path = require('path');
const cors = require('cors');

// Create Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for the minimal version
app.get('/minimal', (req, res) => {
  res.sendFile(path.join(__dirname, 'minimal.html'));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
  console.log(`Minimal version available at http://localhost:${PORT}/minimal`);
  console.log(`Backend API expected at http://localhost:3000`);
}); 