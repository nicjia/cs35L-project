// This code  generated with the help of Claude AI (APPROXIMATELY 70%)
import { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "./Login.css";
import { GENERIC_ERROR_MESSAGE, AUTH_ROUTES, API_ENDPOINTS } from '../constants/authConstants';

/*Forgot Password page component, Handles password reset email request*/
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /*Determines the appropriate error message based on error response*/
  const getErrorMessage = (err) => {
    if (!err.response?.data) {
      return GENERIC_ERROR_MESSAGE.NETWORK_ERROR;
    }
    const { message, error } = err.response.data;
    if (message) return message;
    if (error) return error;
    return GENERIC_ERROR_MESSAGE.SERVER_ERROR;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, {
        email,
      });

      setSuccess(response.data.message);
      setEmail("");
    } catch (err) {
      console.error("Forgot password request failed", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">🎯</div>
          <span className="auth-brand-name">Slate</span>
        </div>

        <h2 className="auth-header">Reset your password</h2>
        <p className="auth-subheader">Enter your email to receive a password reset link</p>

        {error && <p className="auth-error-message">{error}</p>}
        {success && <p className="auth-success-message">{success}</p>}

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

          <button
            type="submit"
            className="auth-submit-button"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-footer-text">
          Remember your password?{" "}
          <Link to={AUTH_ROUTES.LOGIN} className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
