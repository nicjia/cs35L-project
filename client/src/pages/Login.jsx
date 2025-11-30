import React from "react";
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

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
    } catch (err) {
      console.error("Login failed", err);
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          Email:
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          Password:
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <div style={{ textAlign: "right", marginTop: "5px" }}>
          <Link to="/forgot-password" style={{ fontSize: "14px" }}>
            Forgot Password?
          </Link>
        </div>

        <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
          Login
        </button>
      </form>
      <p style={{ marginTop: "20px" }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
