import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext({});
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/api/auth/me`);
      setUser(res.data.user);
    } catch {
      Cookies.remove('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    const { token, user } = res.data;
    Cookies.set('token', token, { expires: 7 });
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const signup = async (data) => {
    const res = await axios.post(`${API}/api/auth/signup`, data);
    return res.data;
  };

  const verifyOTP = async (email, otp, type = 'signup') => {
    const res = await axios.post(`${API}/api/auth/verify-otp`, { email, otp, type });
    if (type === 'signup') {
      const { token, user } = res.data;
      Cookies.set('token', token, { expires: 7 });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    }
    return res.data;
  };

  const logout = () => {
    Cookies.remove('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData) => setUser(prev => ({ ...prev, ...userData }));

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyOTP, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
