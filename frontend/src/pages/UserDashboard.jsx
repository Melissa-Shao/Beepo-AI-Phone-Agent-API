import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [myApiCalls, setMyApiCalls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/user/stats`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch user dashboard data");
        }

        const data = await res.json();

        const count =
          data?.myApiCalls?.api_call_count ?? data?.myApiCalls ?? 0;

        setMyApiCalls(count);
      } catch (err) {
        console.error(err);
        setError("Unable to load user dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

   const handleGoToAiDemo = () => {
    if (myApiCalls >= 20) {
      const confirmed = window.confirm(
        `You have exceeded the 20 free API calls limit (${myApiCalls}/20).\n\nDo you want to continue?`
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
    <div className="dashboard-page">
      <h1 className="dashboard-title">User Dashboard</h1>

      <section className="dashboard-section">
        <h2 className="dashboard-subtitle">My API Usage</h2>

        <div className="stats-grid">
          <div className="stats-card">
            <h3>API Calls Used</h3>
            <p>{myApiCalls} / 20</p>
          </div>
        </div>
      </section>
      <button className="dashboard-link" onClick={handleGoToAiDemo}>
        Call Beepo AI Agent
      </button>
    </div>
  );
}