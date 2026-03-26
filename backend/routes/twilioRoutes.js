const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const goal = req.query.goal || "";
    const turn = Number(req.query.turn || 1);


    console.log("SpeechResult:", userSpeech);
    console.log("Goal:", goal);
    console.log("Turn:", turn);

    const twiml = new twilio.twiml.VoiceResponse();

    if (!userSpeech) {
      twiml.say(
        { voice: "alice", language: "en-US"},
        "Sorry, I did not catch that. Goodbye."
      );
      twiml.hangup();

      res.type("text/xml");
      return res.send(twiml.toString());
    }

    // 
    const normalized = userSpeech.toLowerCase();
    if (
      normalized.includes("goodbye") ||
      normalized.includes("bye") ||
      normalized.includes("thank you")
    ) {
      twiml.say(
        { voice: "alice", language: "en-US" },
        "You're welcome. Goodbye."
      );
      twiml.hangup();

      res.type("text/xml");
      return res.send(twiml.toString());
    }

    // limit the number of turns to testing for now
    if (turn > 3) {
      twiml.say(
        { voice: "alice", language: "en-US"},
        "Thanks for the information. We will follow up soon. Goodbye."
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
    console.log("AI Reply:", aiReply);

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