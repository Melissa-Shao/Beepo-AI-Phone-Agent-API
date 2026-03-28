import { useState } from "react";
import "../App.css"; 

export default function AiDemo() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState("");
  const [callSid, setCallSid] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCall = async () => {
    if (!phoneNumber || !goal) return;

    setLoading(true);
    setResult("");
    setCallSid("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/calls/start`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone_number: phoneNumber, goal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(data.message || "Failed to start call");
        setLoading(false);
        return;
      }

      setCallSid(data.callSid || "");

      let message = `Call started successfully.\n\nAI opening line:\n${data.openingLine}`;

      if (data.overFreeLimit) {
        message =
          `⚠️ Warning: You have exceeded the free API call limit (${data.apiCallCount}/${data.freeLimit}).\n\n` +
          message;
      }

      setResult(message);
    } catch (err) {
      console.error(err);
      setResult("Error starting call");
    }
    setLoading(false);
  };

  return (
    <div className="ai-container">
      <h2>📞 Beepo AI Phone Agent</h2>

      <input
        type="text"
        className="ai-textarea"
        placeholder="Phone number, e.g. +16045551234"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <textarea
        className="ai-textarea"
        placeholder="e.g. Book a dentist appointment for tomorrow"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <button className="ai-button" onClick={handleCall}>
        Call Beepo Agent 
      </button>

      {loading && <p>Generating...</p>}

      {callSid && <p>Call SID: {callSid}</p>}

      {result && (
        <div className="ai-result" style={{ whiteSpace: "pre-line" }}>
          {result}
        </div>
      )}

    </div>
  );
}