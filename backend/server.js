

const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 3000; 

const authRoutes = require('./routes/auth');

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
