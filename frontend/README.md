# Beepo

## Project Description
Beepo is an AI-powered virtual front desk assistant that bridges the gap between automated systems and human-like interaction. By providing a phone number and a conversation goal, Beepo initiates a phone call and manages the conversation with the recipient. During the interaction, Beepo analyzes the conversation context and generates responses that help achieve the goal of the call. When the conversation ends, Beepo returns a summary and transcript of the interaction.

## How to use Beepo
1. Visit the web app: https://beepo-ai-phone-agent-api.vercel.app
2. Create an account or login to access your personal dashboard.
3. Click the ```Call Beepo AI Agent``` button.
4. Enter a recipient's phone number and a clear goal, then click ```Call Beepo Agent``` to queue your phone call.
5. Once the call concludes, return to your dashboard to view the full transcript, a concise call summary, and detailed call information.

## Team Members
- Mariko Hockertz
- Claudia Le
- Melissa Shao

## Technical Architecture and Resources used
- Frontend: React
- Backend: Node.js
- Database: PostgreSQL
- APIs: Google Gemini, Twilio

## Limitations
- Users currently receive a notification once they exceed 20 API calls. While service remains active, the warning will persist.
- Since Beepo relies on Twilio's voice detection, accuracy may be affected by heavy background noise or poor cell reception
- Beepo may struggle with highly dynamic or unpredictable conversations that deviate significantly from the stated goal.
- Beepo currently uses a Twilio trial account, which restricts outbound calls to pre-verified phone numbers only. Additionally, recipients will hear a brief trial notice at the start of each call. Service will cease once the trial credit is exhausted.
- Beepo is currently limited to English-language conversations only.

## Features for the Future
- Implementing a persistent sidebar for easier access between the agent and the dashboard.
- Transitioning from a warning system to a hard cap of 20 calls per user.
- Retry logic for unanswered calls.
- Real-time call monitoring so users can optionally listen in or intervene during a live call.
- Multi-language support to expand accessibility for non-English speakers.