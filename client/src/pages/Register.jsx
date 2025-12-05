
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";
import {GENERIC_ERROR_MESSAGE, AUTH_ROUTES, API_ENDPOINTS } from '../constants/authConstants';;

/*Register page component Handles user registration and navigation to appropriate page*/
export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  // Error handling function
  const getErrorMessage = (err) => {
    // Guard clause: no response from server
    if (!err.response?.data) {
      return GENERIC_ERROR_MESSAGE.NETWORK_ERROR;
    }
  
    const { errors, message, error } = err.response.data;
  
    // Return appropriate error based on response format
    if (errors) return errors.join(", ");
    if (message) return message;
    if (error) return error;
  
    // Default server error for unexpected format
    return GENERIC_ERROR_MESSAGE.SERVER_ERROR;
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, formData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        // Store user info for the profile display
        localStorage.setItem("user", JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email
        }));
        navigate("/home");
      } else {
        navigate(AUTH_ROUTES.LOGIN);
      }
    } catch (err) {
      console.error("Registration failed", err);
      setError(getErrorMessage(err));
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

        <h2 className="auth-header">Create Account</h2>
        <p className="auth-subheader">Get started with your free account</p>
        
        {error && <p className="auth-error-message">{error}</p>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                className="auth-form-input"
                name="firstName"
                placeholder="John"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                className="auth-form-input"
                name="lastName"
                placeholder="Doe"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="auth-form-input"
              name="username"
              placeholder="johndoe"
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-form-input"
              type="email"
              name="email"
              placeholder="john@example.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-form-input"
              type="password"
              name="password"
              placeholder="Create a strong password"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-submit-button">
            Create Account
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to={AUTH_ROUTES.LOGIN} className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
