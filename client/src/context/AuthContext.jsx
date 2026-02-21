import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fleetflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      API.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          setLoading(false);
        })
        .catch(() => {
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('fleetflow_token', res.data.token);
    localStorage.setItem('fleetflow_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await API.post('/auth/register', data);
    localStorage.setItem('fleetflow_token', res.data.token);
    localStorage.setItem('fleetflow_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('fleetflow_token');
    localStorage.removeItem('fleetflow_user');
    setToken(null);
    setUser(null);
  };

  const isRole = (...roles) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
