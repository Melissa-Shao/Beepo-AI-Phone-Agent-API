import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function CallDetail() {
  const { id } = useParams();
  const [call, setCall] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCallDetail = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/calls/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch call detail");
        }

        const data = await res.json();
        setCall(data.call);
        setTranscripts(data.transcripts || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load call detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1 className="dashboard-title">Call Detail</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1 className="dashboard-title">Call Detail</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Call Detail</h1>

      <section className="dashboard-section">
        <div className="table-wrapper">
          <table className="usage-table">
            <tbody>
              <tr>
                <th>Phone</th>
                <td>{call.phone_number}</td>
              </tr>
              <tr>
                <th>Goal</th>
                <td>{call.goal}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  {call.status
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </td>
              </tr>
              <tr>
                <th>Created At</th>
                <td>{new Date(call.created_at).toLocaleString()}</td>
              </tr>
              <tr>
                <th>Completed At</th>
                <td>
                  {call.completed_at
                    ? new Date(call.completed_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
              <tr>
                <th>Outcome Summary</th>
                <td>{call.outcome_summary || "No summary available."}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-subtitle">Transcript</h2>

        <div className="transcript-list">
          {transcripts.length > 0 ? (
            transcripts.map((item, index) => (
              <div
                key={index}
                className={`transcript-item ${
                  item.speaker === "assistant"
                    ? "transcript-assistant"
                    : "transcript-user"
                }`}
              >
                <p className="transcript-speaker">
                  {item.speaker === "assistant" ? "Assistant" : "User"}
                </p>
                <p className="transcript-message">{item.message}</p>
                <p className="transcript-time">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p>No transcript found.</p>
          )}
        </div>
      </section>

      <Link to="/user-dashboard" className="dashboard-link">
        Back to User Dashboard
      </Link>
    </div>
  );
}
