import { useState } from "react";
import "../App.css"; 

export default function AiDemo() {
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!goal) return;

    setLoading(true);
    setResult("");

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/ai/test", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }),
      });

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setResult("Error generating response");
    }

    setLoading(false);
  };

  return (
    <div className="ai-container">
      <h2>📞 Beepo AI Phone Agent Demo</h2>

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

      {result && <div className="ai-result">{result}</div>}
    </div>
  );
}