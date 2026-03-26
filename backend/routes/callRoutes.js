const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /calls/start
router.post("/start", async (req, res) => {
  const { phone_number, goal } = req.body;

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

    const encodedText = encodeURIComponent(openingLine);
    const encodedGoal = encodeURIComponent(goal);

    const call = await twilioClient.calls.create({
      to: phone_number,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.PUBLIC_BASE_URL}/twilio/voice?text=${encodedText}&goal=${encodedGoal}&turn=1`,
      method: "POST",
    });

    res.json({
      status: "success",
      callSid: call.sid,
      phone_number,
      goal,
      openingLine,
    });
  } catch (err) {
    console.error("Twilio call start error:", err);
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Failed to start call",
    });
  }
});

module.exports = router;