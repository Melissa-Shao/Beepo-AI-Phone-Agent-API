import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STRINGS } from "../constants/strings";
import "../styles/style.css";
import { useAuth } from "../../utils/Authorization";

export default function Login({}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || STRINGS.errorFailed);
        return;
      }

      signin({ token: data.token }, () => navigate("/"));
    } catch (err) {
      setError(STRINGS.errorGeneric);
    }
  };

  return (
    <div id="register-modal">
      <h2>{STRINGS.login}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">{STRINGS.login}</button>
      </form>
      <p>
        {STRINGS.dontHave}
        <a href="/register"> {STRINGS.register}</a>
        <br />
        <a id="forgot-password" href="/forgot-password">
          {STRINGS.forgotPassword}
        </a>
      </p>
    </div>
  );
}
