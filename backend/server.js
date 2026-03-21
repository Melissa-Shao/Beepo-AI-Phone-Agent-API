const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require('cookie-parser');

dotenv.config();

const pool = require('./config/db');
const app = express();

app.use(cookieParser());
app.use(cors({
  origin: [
    'https://beepo-ai-phone-agent-api.vercel.app', 
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/auth', require('./routes/authRoutes'));
app.use('/ai', require('./routes/aiRoutes'));
app.use('/dashboard/admin', require('./routes/adminDashboard'));
app.use('/dashboard/user', require('./routes/userDashboard'));


app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});