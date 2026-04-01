import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

export default function UserDashboard() {
  const [myApiCalls, setMyApiCalls] = useState(0);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/dashboard/user/stats`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${import.meta.env.VITE_API_URL}/calls/history`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        if (!statsRes.ok || !historyRes.ok) {
          throw new Error("Failed to fetch user dashboard data");
        }

        const statsData = await statsRes.json();
        const historyData = await historyRes.json();

        const count =
          statsData?.myApiCalls?.api_call_count ?? statsData?.myApiCalls ?? 0;

        setMyApiCalls(count);
        setCalls(historyData.calls || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load user dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleGoToAiDemo = () => {
    if (myApiCalls >= 20) {
      const confirmed = window.confirm(
        `You have exceeded the 20 free API calls limit (${myApiCalls}/20).\n\nDo you want to continue?`,
      );

      if (!confirmed) {
        return;
      }
    }

    navigate("/ai-demo");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1 className="dashboard-title">User Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1 className="dashboard-title">User Dashboard</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className='page-header'>
          <LogoutButton />
      </div>
      <div className="dashboard-page">
        <h1 className="dashboard-title">User Dashboard</h1>

        <section className="dashboard-section">
          <h2 className="dashboard-subtitle">My API Usage</h2>

          <div className="stats-grid">
            <div className="stats-card">
              <h3>API Calls Used</h3>
              <p>{myApiCalls} / 20</p>
            </div>

            <div
              className="stats-card stats-card-action"
              onClick={handleGoToAiDemo}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleGoToAiDemo();
                }
              }}
            >
              <h3>AI Phone Agent</h3>
              <p className="stats-action-text">Call Beepo AI Agent</p>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-subtitle">My Calls</h2>

          <div className="table-wrapper">
            <table className="usage-table">
              <thead>
                <tr>
                  <th>Phone</th>
                  <th>Goal</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {calls.length > 0 ? (
                  calls.map((call) => (
                    <tr
                      key={call.id}
                      onClick={() => navigate(`/calls/${call.id}`)}
                    >
                      <td>{call.phone_number}</td>
                      <td>{call.goal}</td>
                      <td>
                        {call.status
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </td>
                      <td>{new Date(call.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No call history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
