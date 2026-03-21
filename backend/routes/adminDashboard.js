const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const pool = require("../config/db");

router.use(verifyToken, verifyAdmin);

router.get("/stats", async (req, res) => {
  const totalUsers = await pool.query("SELECT COUNT(*) FROM users");
  const totalApiCalls = await pool.query("SELECT COUNT(*) FROM api_usage_logs");

  res.json({ totalUsers: totalUsers.rows[0].count, totalApiCalls: totalApiCalls.rows[0].count });
});

module.exports = router;