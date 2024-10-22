import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';


interface User {
  id: string;
  email: string;
  role: 'student' | 'tpo';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setUser(response.data);
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (email === 'TPO@gmail.com' && password === '123') {
      const tpoUser: User = {
        id: 'tpo-id',
        email: 'TPO@gmail.com',
        role: 'tpo'
      };
      localStorage.setItem('token', 'tpo-token');
      setUser(tpoUser);
    } else {
      const response = await axios.post(`${API_URL}/api/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const signup = async (email: string, password: string) => {
    if (email === 'TPO@gmail.com') {
      throw new Error('This email is reserved for TPO use.');
    }
    const response = await axios.post('http://localhost:5000/api/signup', { email, password, role: 'student' });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};