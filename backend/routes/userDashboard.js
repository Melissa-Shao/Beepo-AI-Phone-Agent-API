const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const pool = require("../config/db");

router.use(verifyToken);

router.get("/stats", async (req, res) => {
  const myApiCalls = await pool.query(
    "SELECT api_call_count FROM users WHERE id = $1",
    [req.user.id]
  );
  res.json({ myApiCalls: myApiCalls.rows[0] });
});

module.exports = router;