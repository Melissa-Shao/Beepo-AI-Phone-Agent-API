const pool = require("../config/db");

const FREE_API_LIMIT = 20;

/**
 * Log one AI API usage and increment user's api_call_count
 * Only call this when Gemini call SUCCESS
 */
async function logApiUsage(userId, endpoint, httpMethod, statusCode) {
  try {
    // 1. insert into api_usage_logs
    await pool.query(
      `
      INSERT INTO api_usage_logs (user_id, endpoint, http_method, status_code)
      VALUES ($1, $2, $3, $4)
      `,
      [userId, endpoint, httpMethod, statusCode]
    );

    // 2. increment user's api_call_count
    await pool.query(
      `
      UPDATE users
      SET api_call_count = api_call_count + 1
      WHERE id = $1
      `,
      [userId]
    );

  } catch (err) {
    console.error("logApiUsage error:", err);
  }
}

/**
 * Get current API usage count for a user
 */
async function getUserApiUsage(userId) {
  try {
    const result = await pool.query(
      `
      SELECT api_call_count
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    return result.rows[0]?.api_call_count || 0;
  } catch (err) {
    console.error("getUserApiUsage error:", err);
    return 0;
  }
}

/**
 * Check if user exceeded free limit
 */
async function hasExceededFreeLimit(userId) {
  const count = await getUserApiUsage(userId);
  return count >= FREE_API_LIMIT;
}

module.exports = {
  logApiUsage,
  getUserApiUsage,
  hasExceededFreeLimit,
  FREE_API_LIMIT,
};