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
          <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="112" height="92" rx="16" fill="#a6cedb" />
            <rect x="12" y="12" width="96" height="76" rx="10" fill="#4a5568" />
            <path d="M20 65 Q35 65 50 50 Q70 30 100 45" stroke="#a6cedb" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>
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
  const [showNotifications, setShowNotifications] = useState(false);
  const today = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateStr = today.toLocaleDateString('en-US', options);

  // Get user info from localStorage or use defaults
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { firstName: 'User' };
  const initials = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';

  // Demo notifications (frontend-only for now)
  const notifications = [
    { id: 1, type: 'reminder', message: 'Task "Project Report" is due today', time: '2h ago', unread: true },
    { id: 2, type: 'overdue', message: 'You have 2 overdue tasks', time: '5h ago', unread: true },
    { id: 3, type: 'completed', message: 'You completed 5 tasks this week! 🎉', time: '1d ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="top-header">
      <div className="header-left">
        <span className="header-date">{dateStr}</span>
      </div>
      <div className="header-right">
        <div className="notification-wrapper">
          <button 
            className={`header-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <span className="notification-title">Notifications</span>
                <button className="mark-read-btn">Mark all read</button>
              </div>
              <div className="notification-list">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${notif.unread ? 'unread' : ''}`}
                    onClick={() => {
                      if (notif.type === 'overdue') navigate('/tasks?filter=overdue');
                      else if (notif.type === 'reminder') navigate('/tasks?filter=today');
                      setShowNotifications(false);
                    }}
                  >
                    <span className="notification-icon">
                      {notif.type === 'reminder' && '📅'}
                      {notif.type === 'overdue' && '⚠️'}
                      {notif.type === 'completed' && '✅'}
                    </span>
                    <div className="notification-content">
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notification-footer">
                <button onClick={() => { navigate('/tasks'); setShowNotifications(false); }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
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
