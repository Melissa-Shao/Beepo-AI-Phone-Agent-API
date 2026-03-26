const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getCallRequestBySid(callSid) {
  const result = await pool.query(
    `
    SELECT id, goal, status
    FROM call_requests
    WHERE twilio_call_sid = $1
    LIMIT 1
    `,
    [callSid]
  );

  return result.rows[0] || null;
}

async function saveTranscript(callRequestId, speaker, message) {
  await pool.query(
    `
    INSERT INTO call_transcripts (call_request_id, speaker, message)
    VALUES ($1, $2, $3)
    `,
    [callRequestId, speaker, message]
  );
}

async function completeCall(callRequestId, summary) {
  await pool.query(
    `
    UPDATE call_requests
    SET status = $1,
        outcome_summary = $2,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = $3
    `,
    ["completed", summary, callRequestId]
  );
}

// POST /twilio/voice
router.post("/voice", (req, res) => {
  try {
    const text = req.query.text || "Hello, this is Beepo calling.";
    const goal = req.query.goal || "";
    const turn = Number(req.query.turn || 1);
    const twiml = new twilio.twiml.VoiceResponse();
    
    twiml.say({ voice: "alice", language: "en-US" }, text);

    const gather = twiml.gather({
      input: ["speech"],
      action: `${process.env.PUBLIC_BASE_URL}/twilio/respond?goal=${encodeURIComponent(goal)}&turn=${turn}`,
      method: "POST",
      speechTimeout: "auto",
      timeout: 5,
    });

    gather.say(
      { voice: "alice", language: "en-US" },
      "Please tell me how I can help you."
    );

    twiml.say(
      { voice: "alice", language: "en-US"},
      "I did not hear anything. Goodbye."
    );
    twiml.hangup();

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (err) {
    console.error("voice route error:", err);
    res.status(500).send("voice webhook failed");
  }
});


// POST /twilio/respond
router.post("/respond", async (req, res) => {
  try {
    const userSpeech = (req.body.SpeechResult || "").trim();
    const callSid = req.body.CallSid;
    const queryGoal = req.query.goal || "";
    const turn = Number(req.query.turn || 1);
    const twiml = new twilio.twiml.VoiceResponse();

    if (!callSid) {
      twiml.say(
        { voice: "alice", language: "en-US" },
        "Sorry, the call session was not found. Goodbye."
      );
      twiml.hangup();
      res.type("text/xml");
      return res.send(twiml.toString());
    }

    const callRequest = await getCallRequestBySid(callSid);

    if (!callRequest) {
      twiml.say(
        { voice: "alice", language: "en-US" },
        "Sorry, the call record was not found. Goodbye."
      );
      twiml.hangup();
      res.type("text/xml");
      return res.send(twiml.toString());
    }

    const callRequestId = callRequest.id;
    const goal = callRequest.goal || queryGoal;

    if (!userSpeech) {
      const retryGather = twiml.gather({
        input: ["speech"],
        action: `${process.env.PUBLIC_BASE_URL}/twilio/respond?goal=${encodeURIComponent(goal)}&turn=${turn}`,
        method: "POST",
        speechTimeout: "auto",
        timeout: 5,
      });

      retryGather.say(
        { voice: "alice", language: "en-US" },
        "Sorry, I did not catch that. Please say that again."
      );

      twiml.say(
        { voice: "alice", language: "en-US" },
        "I still did not hear anything. Goodbye."
      );
      twiml.hangup();

      await completeCall(callRequestId, "Call ended due to no speech input.");

      res.type("text/xml");
      return res.send(twiml.toString());
    }

    // save caller speech
    await saveTranscript(callRequestId, "user", userSpeech);

    // 
    const normalized = userSpeech.toLowerCase();

    const wantsToEnd =
      normalized.includes("goodbye") ||
      normalized.includes("bye") ||
      normalized.includes("thank you") ||
      normalized.includes("thanks, bye") ||
      normalized.includes("that's all") ||
      normalized.includes("that is all") ||
      normalized.includes("no thanks") ||
      normalized.includes("no thank you");

    if (wantsToEnd) {
      const goodbyeMessage = "You're welcome. Goodbye.";

      await saveTranscript(callRequestId, "assistant", goodbyeMessage);
      await completeCall(callRequestId, "Caller ended the conversation.");

      twiml.say(
        { voice: "alice", language: "en-US" },
        goodbyeMessage
      );
      twiml.hangup();

      res.type("text/xml");
      return res.send(twiml.toString());
    }

    // limit the number of turns to testing for now
    if (turn > 10) {
      const closingMessage = "Thank you for the conversation. Goodbye.";
      await saveTranscript(callRequestId, "assistant", closingMessage);
      await completeCall(callRequestId, "Call ended after reaching the turn limit.");

      twiml.say(
        { voice: "alice", language: "en-US"},
        closingMessage
      );
      twiml.hangup();

      res.type("text/xml");
      return res.send(twiml.toString());
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are Beepo, an AI phone agent in an active phone call.

      Goal: ${goal}

      The caller just said:
      ${userSpeech}

      Reply naturally and briefly for a phone conversation.

      Rules:
      - Keep it under 2 sentences
      - Be polite and conversational
      - Ask one clear follow-up question if needed
      - Do not use bullet points
      - Do not use quotation marks
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiReply = response.text().trim();

    // save assistant reply
    await saveTranscript(callRequestId, "assistant", aiReply);

    twiml.say({ voice: "alice", language: "en-US"}, aiReply);

    const nextTurn = turn + 1;

    const gather = twiml.gather({
      input: ["speech"],
      action: `${process.env.PUBLIC_BASE_URL}/twilio/respond?goal=${encodeURIComponent(goal)}&turn=${nextTurn}`,
      method: "POST",
      speechTimeout: "auto",
      timeout: 5,
    });

    gather.say(
      { voice: "alice", language: "en-US"},
      "Please go ahead."
    );

    twiml.say(
      { voice: "alice", language: "en-US"},
      "I did not hear anything. Goodbye."
    );
    twiml.hangup();

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (err) {
    console.error("respond route error:", err);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say(
      { voice: "alice", language: "en-US"},
      "Sorry, something went wrong. Goodbye."
    );
    twiml.hangup();

    res.type("text/xml");
    res.send(twiml.toString());
  }
});

module.exports = router;