const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Create a Gemini client using the API key stored in the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/test', async (req, res) => {
  const { goal } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
      You are an AI phone agent named Beepo.
      Goal: ${goal}
      Generate a short and polite phone conversation script.
      Tone: friendly and professional
      Rules:
      - Keep it realistic and natural
      - Do NOT include explanations
      - Do NOT use quotation marks
      Format:
      Agent: ...
      Customer: ...
      Agent: ...
      `;
    // Send the prompt to Gemini and wait for the generated response, generateContent is a method provided by Gemini client to send the prompt and get the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      message: "AI response",
      result: text
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI error" });
  }
});

module.exports = router;