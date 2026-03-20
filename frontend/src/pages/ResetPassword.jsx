import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { STRINGS } from "../constants/strings";
import "../styles/style.css";

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, newPassword }),
    });
    const data = await response.json();
    setMessage(data.message);
    if (response.ok) {
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div id="register-modal">
      <h2>{STRINGS.resetPassword}</h2>
      {message && <p>{message}</p>}
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
          <label>{STRINGS.newPassword}</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{STRINGS.resetPassword}</button>
      </form>
    </div>
  );
}