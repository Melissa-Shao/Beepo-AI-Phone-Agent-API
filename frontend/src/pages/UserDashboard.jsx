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
      <div>
        <h1>User Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>User Dashboard</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      <h2>My API Usage</h2>
      <p>API calls used: {myApiCalls}</p>
      <Link to="/ai-demo">
        Try AI Demo
      </Link>
    </div>
  );
}