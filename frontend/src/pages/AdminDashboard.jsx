import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApiCalls: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData  = async () => {
      try {
        const [statsRes, usageRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/dashboard/admin/stats`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${import.meta.env.VITE_API_URL}/dashboard/admin/api-usage`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        if (!statsRes.ok || !usageRes.ok) {
          throw new Error("Failed to fetch admin dashboard data");
        }

        const statsData = await statsRes.json();
        const usageData = await usageRes.json();

        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalApiCalls: statsData.totalApiCalls || 0,
        });

        setUsers(usageData.users || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p>{error}</p>
      </div>
    );
  }

 return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <section className="dashboard-section">
        <h2 className="dashboard-subtitle">System Stats</h2>

        <div className="stats-grid">
          <div className="stats-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>

          <div className="stats-card">
            <h3>Total API Calls</h3>
            <p>{stats.totalApiCalls}</p>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-subtitle">User API Usage</h2>

        <div className="table-wrapper">
          <table className="usage-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>User Type</th>
                <th>API Calls Used</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.user_type}</td>
                    <td>{user.api_call_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No usage data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}