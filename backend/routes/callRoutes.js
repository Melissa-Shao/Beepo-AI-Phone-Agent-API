const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");
const {logApiUsage,getUserApiUsage,FREE_API_LIMIT} = require("../services/apiUsageService");

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /calls/start
router.post("/start", verifyToken, async (req, res) => {
  const { phone_number, goal } = req.body;
  const user_id = req.user.id;

  if (!phone_number || !goal) {
    return res.status(400).json({
      status: "error",
      message: "phone_number and goal are required",
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are Beepo, an AI phone agent.

      Goal: ${goal}

      Generate one short, natural, polite opening line for a phone call.

      Rules:
      - Keep it under 2 sentences
      - Do not include labels like Agent:
      - Do not include explanations
      - Do not use quotation marks
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const openingLine = response.text().trim();

    // log successful Gemini usage for opening line generation
    await logApiUsage(user_id, "/calls/start", "POST", 200);
    // Get updated API count and free-limit status
    const apiCallCount = await getUserApiUsage(user_id);
    const overFreeLimit = apiCallCount >= FREE_API_LIMIT;

    // 1. create call_requests row
    const insertCallResult = await pool.query(
      `
      INSERT INTO call_requests (user_id, phone_number, goal, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [user_id, phone_number, goal, "in_progress"]
    );

    const callRequestId = insertCallResult.rows[0].id;
    const encodedText = encodeURIComponent(openingLine);
    const encodedGoal = encodeURIComponent(goal);

    // 2. create twilio call
    const call = await twilioClient.calls.create({
      to: phone_number,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.PUBLIC_BASE_URL}/twilio/voice?text=${encodedText}&goal=${encodedGoal}&turn=1`,
      method: "POST",
    });

     // 3. save twilio_call_sid
      await pool.query(
      `
      UPDATE call_requests
      SET twilio_call_sid = $1, updated_at = NOW()
      WHERE id = $2
      `,
      [call.sid, callRequestId]
    );

    // 4. save opening line transcript
    await pool.query(
      `
      INSERT INTO call_transcripts (call_request_id, speaker, message)
      VALUES ($1, $2, $3)
      `,
      [callRequestId, "assistant", openingLine]
    );

    res.json({
      status: "success",
      callSid: call.sid,
      callRequestId,
      phone_number,
      goal,
      openingLine,
      apiCallCount,
      freeLimit: FREE_API_LIMIT,
      overFreeLimit,
    });
  } catch (err) {
    console.error("Twilio call start error:", err);
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Failed to start call",
    });
  }
});

// GET /calls/history
router.get("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT id, phone_number, goal, status, outcome_summary, created_at, completed_at
      FROM call_requests
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json({
      calls: result.rows,
    });
  } catch (err) {
    console.error("Fetch call history error:", err);
    res.status(500).json({ message: "Failed to fetch call history" });
  }
});

// GET /calls/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const callId = req.params.id;

    const callResult = await pool.query(
      `
      SELECT id, user_id, phone_number, goal, status, outcome_summary, created_at, completed_at
      FROM call_requests
      WHERE id = $1 AND user_id = $2
      LIMIT 1
      `,
      [callId, userId]
    );

    if (callResult.rows.length === 0) {
      return res.status(404).json({ message: "Call not found" });
    }

    const transcriptResult = await pool.query(
      `
      SELECT speaker, message, created_at
      FROM call_transcripts
      WHERE call_request_id = $1
      ORDER BY created_at ASC, id ASC
      `,
      [callId]
    );

    res.json({
      call: callResult.rows[0],
      transcripts: transcriptResult.rows,
    });
  } catch (err) {
    console.error("Fetch call detail error:", err);
    res.status(500).json({ message: "Failed to fetch call detail" });
  }
});

module.exports = router;