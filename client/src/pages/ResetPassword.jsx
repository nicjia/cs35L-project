// This code  generated with the help of Claude AI (APPROXIMATELY 70%)
import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./Login.css";
import { GENERIC_ERROR_MESSAGE, AUTH_ROUTES, API_ENDPOINTS, VALIDATION_RULES } from '../constants/authConstants';

/*Reset Password page component, Handles password reset with token*/
export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  const navigate = useNavigate();
  const { token } = useParams();

  /*Verify token validity on component mount*/
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get(`${API_ENDPOINTS.FORGOT_PASSWORD.replace('forgot-password', 'verify-reset-token')}/${token}`);
        setIsValidToken(response.data.valid);
        if (!response.data.valid) {
          setError(response.data.message || "Invalid or expired reset token");
        }
      } catch (err) {
        console.error("Token verification failed", err);
        setError(GENERIC_ERROR_MESSAGE.SERVER_ERROR);
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("No reset token provided");
      setIsValidating(false);
    }
  }, [token]);

  /*Determines the appropriate error message based on error response*/
  const getErrorMessage = (err) => {
    if (!err.response?.data) {
      return GENERIC_ERROR_MESSAGE.NETWORK_ERROR;
    }
    const { message, error, errors } = err.response.data;
    if (errors) return errors.join(", ");
    if (message) return message;
    if (error) return error;
    return GENERIC_ERROR_MESSAGE.SERVER_ERROR;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError(GENERIC_ERROR_MESSAGE.PASSWORD_MISMATCH);
      return;
    }

    // Validate password length
    if (newPassword.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
      setError(GENERIC_ERROR_MESSAGE.PASSWORD_TOO_SHORT);
      return;
    }

    setIsLoading(true);

    try {
      await api.post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        newPassword,
      });

      // Navigate to login page with success message
      navigate(AUTH_ROUTES.LOGIN, {
        state: { message: "Password reset successful! Please log in with your new password." }
      });
    } catch (err) {
      console.error("Password reset failed", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-icon">🎯</div>
            <span className="auth-brand-name">Slate</span>
          </div>
          <h2 className="auth-header">Verifying reset link...</h2>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-icon">🎯</div>
            <span className="auth-brand-name">Slate</span>
          </div>
          <h2 className="auth-header">Invalid Reset Link</h2>
          {error && <p className="auth-error-message">{error}</p>}
          <p className="auth-footer-text">
            <Link to={AUTH_ROUTES.FORGOT_PASSWORD} className="auth-link">
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">🎯</div>
          <span className="auth-brand-name">Slate</span>
        </div>

        <h2 className="auth-header">Set new password</h2>
        <p className="auth-subheader">Enter your new password below</p>

        {error && <p className="auth-error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="newPassword">
              New Password
            </label>
            <input
              id="newPassword"
              className="auth-form-input"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={VALIDATION_RULES.MIN_PASSWORD_LENGTH}
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              className="auth-form-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={VALIDATION_RULES.MIN_PASSWORD_LENGTH}
            />
          </div>

          <button
            type="submit"
            className="auth-submit-button"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
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
