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
        navigate(AUTH_ROUTES.TASKS);
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
      <h2 className="auth-header">Create Account</h2>
      {error && <p className="auth-error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="auth-form">


      <div className="auth-form-group">
          <input
            className="auth-form-input"
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-form-group">
          <input
            className="auth-form-input"
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-form-group">
          <input
            className="auth-form-input"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-form-group">
          <input
            className="auth-form-input"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-form-group">
          <input
            className="auth-form-input"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="auth-submit-button">
          Register
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account? <Link to={AUTH_ROUTES.LOGIN} className="auth-link">Login here</Link>
      </p>
    </div>
  );
}
