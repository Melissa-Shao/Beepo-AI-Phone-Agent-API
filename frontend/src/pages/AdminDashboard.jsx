import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalApiCalls, setTotalApiCalls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/admin/stats`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch admin dashboard data");
        }

        const data = await res.json();

        setTotalUsers(data.totalUsers);
        setTotalApiCalls(data.totalApiCalls);
      } catch (err) {
        console.error(err);
        setError("Unable to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Admin Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Admin Dashboard</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>System Stats</h2>
      <p>Total users: {totalUsers}</p>
      <p>Total API calls: {totalApiCalls}</p>
    </div>
  );
}