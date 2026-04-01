import { useState, useEffect, useContext, createContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signin = (newUser, callback) => {
    setUser(newUser);
    callback();
  };

  const signout = async (callback) => {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    callback();
  };

  const value = { user, signin, signout };

  if (loading) return null;
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
