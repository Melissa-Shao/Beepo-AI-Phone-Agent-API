import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STRINGS } from "../constants/strings";
import "../App.css"; 

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || STRINGS.errorFailed);
        return;
      }

      navigate("/login");
    } catch (err) {
      setError(STRINGS.errorGeneric);
    }
  };

  return (
    <div className="main-container">
      <h1>{STRINGS.welcome}</h1>
      <h4 className='summary'>{STRINGS.summary}</h4>
      <div id="register-modal">
        <h2>{STRINGS.register}</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <label>{STRINGS.username}</label>
            <input
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-field">
            <label>{STRINGS.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-field">
            <label>{STRINGS.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">{STRINGS.register}</button>
        </form>
        <p>
          {STRINGS.alreadyHave} <a href="/login">{STRINGS.login}</a>
        </p>
      </div>
    </div>
  );
}
