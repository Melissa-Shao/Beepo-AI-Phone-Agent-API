const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const pool = require("../config/db");

router.use(requireAuth);

router.get("/stats", async (req, res) => {
  const myApiCalls = await pool.query(
    "SELECT api_call_count FROM user WHERE id = $1",
    [req.user.id]
  );
  res.json({ myApiCalls: myApiCalls.rows[0].count });
});

module.exports = router;