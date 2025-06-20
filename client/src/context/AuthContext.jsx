import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user
  const loadUser = useCallback(async () => {
    try {
      if (token) {
        const response = await authAPI.getUser();
        if (response.success && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid user data returned');
        }
      }
    } catch (err) {
      console.error('Load user error:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Register user
  const register = async (formData) => {
    try {
      const response = await authAPI.register(formData.name, formData.email, formData.password);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        await loadUser();
        return true;
      }
      setError(response.message || 'Registration failed');
      return false;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const response = await authAPI.login(formData.email, formData.password);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        await loadUser();
        return true;
      }
      setError(response.message || 'Login failed');
      return false;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Clear errors
  const clearErrors = () => {
    setError(null);
  };

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
