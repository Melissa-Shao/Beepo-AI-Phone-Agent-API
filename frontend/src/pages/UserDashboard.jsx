import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const [myApiCalls, setMyApiCalls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            <p>{myApiCalls}</p>
          </div>
        </div>
      </section>
      <Link to="/ai-demo" className="dashboard-link">
        Call Beepo AI Agent
      </Link>
    </div>
  );
}