// backend/server.js
// This is the main entry point for your Node.js Express backend.

const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const app = express();
const PORT = process.env.PORT || 3000; // Define the port for the server

// Import authentication routes
// Make sure this path correctly points to your auth.js file
const authRoutes = require('./routes/auth');

// Middleware:
// 1. CORS: Enables Cross-Origin Resource Sharing. This is crucial for
//    allowing your Angular frontend (running on a different origin/port)
//    to make requests to this backend. In production, you might want
//    to configure CORS to allow requests only from your frontend's domain.
app.use(cors());

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Coding Platform Backend API is running!');
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Access the API at: http://localhost:3000');
  console.log('Auth endpoints: http://localhost:3000/api/auth/register and http://localhost:3000/api/auth/login');
});
