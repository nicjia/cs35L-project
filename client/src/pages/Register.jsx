import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

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
      const response = await api.post("/auth/register", formData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/tasks");
      } else {
        navigate("/");
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
          setError("Registration error");
        }
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div
      className="Register"
      style={{ maxWidth: "300px", margin: "50px auto" }}
    >
      <h2>Create Account</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <input
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
          required
        />
        <input
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
          required
        />
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
          Register
        </button>
      </form>

      <p style={{ marginTop: "20px" }}>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
}
