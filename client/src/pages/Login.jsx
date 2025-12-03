import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { GENERIC_ERROR_MESSAGE, AUTH_ROUTES, API_ENDPOINTS, HTTP_STATUS } from '../constants/authConstants';

/*Login page component, Handles user authentication and navigation to tasks page*/
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  /*Determines the appropriate error message based on error response param {Error} err - Error object from API call returns {string} User-friendly error message */
  const getErrorMessage = (err) => {
    // Guard clause: no response from server
    if (!err.response) {
      return GENERIC_ERROR_MESSAGE.SERVER_ERROR;
    }

    // Guard clause: unauthorized
    if (err.response.status === HTTP_STATUS.UNAUTHORIZED) {
      return GENERIC_ERROR_MESSAGE.UNAUTHORIZED;
    }

    // Default server error
    return GENERIC_ERROR_MESSAGE.SERVER_ERROR;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
    });

      // Save authentication token and user info
      localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      // Navigate to home page
      navigate("/home");
    } catch (err) {
      console.error("Login failed", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  


  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="112" height="92" rx="16" fill="#a6cedb" />
              <rect x="12" y="12" width="96" height="76" rx="10" fill="#4a5568" />
              <path d="M20 65 Q35 65 50 50 Q70 30 100 45" stroke="#a6cedb" strokeWidth="6" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span className="auth-brand-name">Slate</span>
        </div>
        
        <h2 className="auth-header">Welcome back</h2>
        <p className="auth-subheader">Sign in to continue to your tasks</p>
        
        {error && <p className="auth-error-message">{error}</p>}
        
        <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form-group">
          <label className="auth-form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="auth-form-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="auth-form-group">
          <label className="auth-form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="auth-form-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <div style={{ textAlign: 'right', marginTop: '4px' }}>
            <Link to={AUTH_ROUTES.FORGOT_PASSWORD} className="auth-link" style={{ fontSize: '13px' }}>
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit-button"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
        </form>
        
        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to={AUTH_ROUTES.REGISTER} className="auth-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}