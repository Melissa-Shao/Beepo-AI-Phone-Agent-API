const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Create a Gemini client using the API key stored in the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate-conversation', async (req, res) => {
  const { phone_number, goal } = req.body;

    if (!phone_number || !goal) {
    return res.status(400).json({
      status: 'error',
      message: 'phone_number and goal are required'
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
      You are an AI phone agent named Beepo.
      Phone number: ${phone_number}
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
      After the conversation, provide a one-sentence summary starting with: 
      Summary:
      `;
    // Send the prompt to Gemini and wait for the generated response, generateContent is a method provided by Gemini client to send the prompt and get the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Split AI output into conversation + summary
    const summaryMarker = 'Summary:';
    let conversation = text;
    let summary = '';

    if (text.includes(summaryMarker)) {
      const parts = text.split(summaryMarker);
      conversation = parts[0].trim();
      summary = parts[1].trim();
    }

    res.json({
      status: 'success',
      phone_number,
      goal,
      conversation,
      summary
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: "AI error" });
  }
});

module.exports = router;