const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');


router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // determines if user exists in db
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // hashes password before storing using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // inserts new user in db
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, email, user_type',
      [username, email, hashedPassword]
    );

    // return JWT token for registered user
    // use in frontend, store in localStorage to identify user
    const token = jwt.sign(
      { id: newUser.rows[0].id, email: newUser.rows[0].email, user_type: newUser.rows[0].user_type },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // search for user in db
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // see if password matches
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // return JWT token for logged in user
    // use in frontend, store in localStorage to identify user
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email, user_type: user.rows[0].user_type },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token, user_type: user.rows[0].user_type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;