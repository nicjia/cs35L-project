import React from "react";
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { AUTH_ERRORS, AUTH_ROUTES, HTTP_STATUS } from '../constants/authConstants';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      //If successful: save the token
      localStorage.setItem("token", response.data.token);
      navigate("/tasks");
    }
    
    catch (err) {
      console.error("Login failed", err);
      if (err.response && err.response.status === HTTP_STATUS.UNAUTHORIZED) 
      {
        setError(AUTH_ERRORS.UNAUTHORIZED);  
      }
     else 
     {
        setError(AUTH_ERRORS.SERVER_ERROR); 
      }
    }

    navigate(AUTH_ROUTES.TASKS);
  };

  return (
    <div className="auth-container">
      <h2 className="auth-header">Login</h2>
      {error && (
        <p className="auth-error-message">{error}</p>
      )}
      <form
        onSubmit={handleSubmit} 
        className="auth-form"
      >
        <div className="auth-form-group">
          <label className="auth-form-label">Email:</label>
          <input
            className="auth-form-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>


      
        
        <div className="auth-form-group">
          <label className="auth-form-label">Password:</label>
          <input
            className="auth-form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-submit-button">
          Login
        </button>
      </form>
      
      <p className="auth-footer-text">
        Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
      </p>
    </div>
  );
}
