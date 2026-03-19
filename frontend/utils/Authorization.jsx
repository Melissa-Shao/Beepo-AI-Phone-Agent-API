import { useState, useContext, createContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? {token} : null;
  });

  const signin = (newUser, callback) => {
    localStorage.setItem("token", newUser.token);
    setUser(newUser);
    callback();
  };

  const signout = (callback) => {
    localStorage.removeItem("token");
    setUser(null);
    callback();
  };

  const value = { user, signin, signout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
