import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '@/styles/components/admin-login.scss';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

/**
 * AdminLogin component
 * Provides secure authentication for admin access
 * Uses server-side validation and session management
 */
const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      // Validate input
      if (!username.trim() || !password.trim()) {
        setError('Please enter both username and password');
        return;
      }

      // Send login request
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        // Clear sensitive data
        setUsername('');
        setPassword('');
        
        // Notify parent of successful login
        onLoginSuccess();
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Show appropriate error message based on response
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <FontAwesomeIcon icon={faLock} className="lock-icon" />
          <h1>Admin Login</h1>
          <p>Please log in to access the admin panel</p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              aria-label="Username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              aria-label="Password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
