import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";
import {GENERIC_ERROR_MESSAGE, AUTH_ROUTES, API_ENDPOINTS, HTTP_STATUS } from '../constants/authConstants';;


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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          setError(err.response.data.errors.join(", "));
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError(GENERIC_ERROR_MESSAGE.SERVER_ERROR);
        }
      } else {
        setError(GENERIC_ERROR_MESSAGE.NETWORK_ERROR);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">🎯</div>
          <span className="auth-brand-name">Slate</span>
        </div>

        <h2 className="auth-header">Create Account</h2>
        <p className="auth-subheader">Get started with your free account</p>
        
        {error && <p className="auth-error-message">{error}</p>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
