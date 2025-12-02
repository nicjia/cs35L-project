import React, { useState } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

import { TaskProvider } from "./contexts/TaskContext.jsx";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

// Sidebar Component
const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({ tasks: true });

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span>🎯</span>
        </div>
        <span className="sidebar-brand">Slate</span>
      </div>

      <div className="sidebar-search">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for..." 
          />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <Link 
            to="/home" 
            className={`nav-item ${isActive('/home') ? 'active' : ''}`}
          >
            <span className="nav-item-icon">🏠</span>
            Home
          </Link>
        </div>

        <div className="nav-section">
          <button 
            className="nav-item"
            onClick={() => toggleDropdown('tasks')}
          >
            <span className="nav-item-icon">📋</span>
            Tasks
            <span className={`nav-item-arrow ${openDropdowns.tasks ? 'expanded' : ''}`}>›</span>
          </button>
          <div className={`nav-dropdown ${openDropdowns.tasks ? 'open' : ''}`}>
            <Link to="/tasks" className="nav-dropdown-item">
              <span className="dot"></span>
              All Tasks
            </Link>
            <Link to="/tasks?filter=today" className="nav-dropdown-item">
              <span className="dot"></span>
              Today
            </Link>
            <Link to="/tasks?filter=upcoming" className="nav-dropdown-item">
              <span className="dot"></span>
              Upcoming
            </Link>
          </div>
        </div>

        <div className="nav-section">
          <button 
            className="nav-item"
            onClick={() => toggleDropdown('projects')}
          >
            <span className="nav-item-icon">📁</span>
            Projects
            <span className="nav-item-badge">3</span>
            <span className={`nav-item-arrow ${openDropdowns.projects ? 'expanded' : ''}`}>›</span>
          </button>
          <div className={`nav-dropdown ${openDropdowns.projects ? 'open' : ''}`}>
            <Link to="/home" className="nav-dropdown-item">
              <span className="dot" style={{background: '#fb7185'}}></span>
              Work
            </Link>
            <Link to="/home" className="nav-dropdown-item">
              <span className="dot" style={{background: '#fbbf24'}}></span>
              Personal
            </Link>
            <Link to="/home" className="nav-dropdown-item">
              <span className="dot" style={{background: '#4ade80'}}></span>
              Study
            </Link>
          </div>
        </div>

        <div className="nav-section">
          <Link 
            to="/profile" 
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="nav-item-icon">⚙️</span>
            Settings
          </Link>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

// Top Header Component
const TopHeader = () => {
  const navigate = useNavigate();
  const today = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateStr = today.toLocaleDateString('en-US', options);

  // Get user info from localStorage or use defaults
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { firstName: 'User' };
  const initials = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';

  return (
    <header className="top-header">
      <div className="header-left">
        <span className="header-date">{dateStr}</span>
      </div>
      <div className="header-right">
        <button className="header-icon-btn">🔔</button>
        <button 
          className="profile-btn"
          onClick={() => navigate('/profile')}
        >
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <div className="profile-name">{user.firstName || 'User'}</div>
            <div className="profile-role">Member</div>
          </div>
        </button>
      </div>
    </header>
  );
};

const RequireAuth = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  if (!token) return <Navigate to="/" replace />;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <TaskProvider>
      <Sidebar onLogout={handleLogout} />
      <main>
        <TopHeader />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </TaskProvider>
  );
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public routes (no Sidebar / full-bleed) */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected routes rendered inside RequireAuth which contains the Sidebar + main */}
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tasks" element={<Tasks />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
