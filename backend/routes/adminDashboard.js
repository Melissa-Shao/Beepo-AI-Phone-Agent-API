const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const pool = require("../config/db");

router.use(verifyToken, verifyAdmin);

router.get("/stats", async (req, res) => {
  try {
    const totalUsersResult = await pool.query(
      "SELECT COUNT(*) AS total_users FROM users"
    );

    const totalApiCallsResult = await pool.query(
      "SELECT COALESCE(SUM(api_call_count), 0) AS total_api_calls FROM users"
    );

    res.json({
      totalUsers: Number(totalUsersResult.rows[0].total_users),
      totalApiCalls: Number(totalApiCallsResult.rows[0].total_api_calls),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});


// Per-user usage table
router.get("/api-usage", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, user_type, api_call_count
      FROM users
      ORDER BY api_call_count DESC, id ASC
    `);

    res.json({
      users: result.rows
    });
  } catch (err) {
    console.error("Admin usage error:", err);
    res.status(500).json({ message: "Failed to fetch API usage data" });
  }
});


module.exports = router;