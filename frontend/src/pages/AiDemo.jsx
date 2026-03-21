import { useState } from "react";
import "../App.css"; 

export default function AiDemo() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [goal, setGoal] = useState("");
  const [conversation, setConversation] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!phoneNumber || !goal) return;

    setLoading(true);
    setConversation("");
    setSummary("");

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/ai/generate-conversation", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone_number: phoneNumber, goal }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setConversation(data.conversation || "");
        setSummary(data.summary || "");
      } else {
        setConversation("Error generating response");
      }
    } catch (err) {
      console.error(err);
      setConversation("Error generating response");
    }
    setLoading(false);
  };

  return (
    <div className="ai-container">
      <h2>📞 Beepo AI Phone Agent Demo</h2>

      <input
        type="text"
        className="ai-textarea"
        placeholder="Phone number, e.g. 555-123-4567"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <textarea
        className="ai-textarea"
        placeholder="e.g. Book a dentist appointment for tomorrow"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <button className="ai-button" onClick={handleGenerate}>
        Call Beepo Agent 
      </button>

      {loading && <p>Generating...</p>}

      {conversation && (
        <div className="ai-result">
          <h3>Conversation</h3>
          {conversation}
        </div>
      )}

      {summary && (
        <div className="ai-result">
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      )}
      
    </div>
  );
}