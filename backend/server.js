const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const pool = require('./config/db');
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Beepo backend running");
});

app.use('/auth', require('./routes/authRoutes'));
app.use('/ai', require('./routes/aiRoutes'));

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});