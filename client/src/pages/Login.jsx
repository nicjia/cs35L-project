import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';



export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit  =(event) => {
        event.preventDefault();

        console.log("Logging in ...");
    };

    return (
        <div className="login-container">
          <h2 className="login-title">Welcome Back</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username:</label>
              <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
    
            <div className="form-group">
              <label className="form-label">Password:</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="signup-section">
                <p>Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link></p>
            </div>
    
            <button type="submit" className="login-button">
              Login
            </button>
            
          </form>
        </div>
      );


}

