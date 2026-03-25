const express = require("express");
const router = express.Router();
const twilio = require("twilio");

router.post("/voice", (req, res) => {
  try {
    const text = req.query.text || "Hello, this is Beepo calling.";
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say({ voice: "alice" }, text);

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (err) {
    console.error("voice route error:", err);
    res.status(500).send("voice webhook failed");
  }
});

module.exports = router;