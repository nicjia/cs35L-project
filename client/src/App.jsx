import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { notificationsApi, friendsApi, userApi } from "./services/api";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";
import Friends from "./pages/Friends";
import UserProfile from "./pages/UserProfile";
import Login from "./pages/Login";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

// Sidebar Component
const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState({ tasks: true });
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Pages for navigation search
  const pages = [
    { name: 'Home', path: '/home', keywords: ['home', 'dashboard', 'overview'] },
    { name: 'All Tasks', path: '/tasks', keywords: ['tasks', 'todos', 'all tasks'] },
    { name: 'Today\'s Tasks', path: '/tasks?filter=today', keywords: ['today', 'due today'] },
    { name: 'Upcoming Tasks', path: '/tasks?filter=upcoming', keywords: ['upcoming', 'soon', 'week'] },
    { name: 'Overdue Tasks', path: '/tasks?filter=overdue', keywords: ['overdue', 'late', 'missed'] },
    { name: 'High Priority', path: '/tasks?filter=high', keywords: ['high', 'priority', 'urgent', 'important'] },
    { name: 'Completed', path: '/tasks?filter=completed', keywords: ['completed', 'done', 'finished'] },
    { name: 'Friends', path: '/friends', keywords: ['friends', 'users', 'people', 'social'] },
    { name: 'Settings', path: '/profile', keywords: ['settings', 'profile', 'account', 'preferences'] },
  ];

  // Handle search input change - pages only
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSidebarSearch(value);

    if (value.length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Show page results immediately
    const lowerValue = value.toLowerCase();
    const pageMatches = pages.filter(page => 
      page.name.toLowerCase().includes(lowerValue) ||
      page.keywords.some(kw => kw.includes(lowerValue))
    ).map(p => ({ type: 'page', ...p }));

    setSearchResults(pageMatches);
    setShowSearchResults(true);
  };

  // Navigate to result
  const handleResultClick = (result) => {
    navigate(result.path);
    setSidebarSearch('');
    setShowSearchResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      <div className="sidebar-search" ref={searchRef}>
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search pages..." 
            value={sidebarSearch}
            onChange={handleSearchChange}
            onFocus={() => sidebarSearch && setShowSearchResults(true)}
          />
        </div>
        {showSearchResults && searchResults.length > 0 && (
          <div className="sidebar-search-results">
            <div className="search-result-section">
              {searchResults.map((result, i) => (
                <button key={i} className="search-result-item" onClick={() => handleResultClick(result)}>
                  <span className="search-result-icon">📄</span>
                  {result.name}
                </button>
              ))}
            </div>
          </div>
        )}
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
            to="/friends" 
            className={`nav-item ${isActive('/friends') || location.pathname.startsWith('/user/') ? 'active' : ''}`}
          >
            <span className="nav-item-icon">👥</span>
            Friends
          </Link>
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
const TopHeader = ({ toasts, setToasts }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const notifRef = useRef(null);
  const today = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateStr = today.toLocaleDateString('en-US', options);

  // Get user info from localStorage or use defaults
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { firstName: 'User' };
  const initials = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check for new notifications and show toast
  const prevNotifCountRef = useRef(0);
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount > prevNotifCountRef.current && prevNotifCountRef.current !== 0) {
      // New notification arrived - show toast
      const newNotif = notifications.find(n => !n.isRead);
      if (newNotif) {
        showToast(newNotif);
      }
    }
    prevNotifCountRef.current = unreadCount;
  }, [notifications]);

  // Show toast notification
  const showToast = (notif) => {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    if (preferences.notifications === false) return; // Respect notification preference

    const toastId = Date.now();
    const toast = {
      id: toastId,
      type: notif.type,
      message: notif.message,
      fromUser: notif.fromUser,
    };
    setToasts(prev => [...prev, toast]);

    // Try browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification('Slate', { body: notif.message, icon: '/favicon.ico' });
    }

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 5000);
  };

  // Request browser notification permission
  useEffect(() => {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    if (preferences.notifications && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle accept friend request from notification
  const handleAcceptFriend = async (notif) => {
    try {
      await friendsApi.acceptRequest(notif.referenceId);
      await notificationsApi.markAsRead(notif.id);
      fetchNotifications();
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  // Handle reject friend request from notification
  const handleRejectFriend = async (notif) => {
    try {
      await friendsApi.rejectRequest(notif.referenceId);
      await notificationsApi.markAsRead(notif.id);
      fetchNotifications();
    } catch (err) {
      console.error('Error rejecting friend request:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notif) => {
    await notificationsApi.markAsRead(notif.id);
    
    if (notif.type === 'friend_request') {
      navigate('/friends');
    } else if (notif.type === 'friend_accepted') {
      navigate(`/user/${notif.fromUser?.username}`);
    } else if (notif.type === 'bump') {
      navigate('/tasks');
    } else if (notif.type === 'overdue') {
      navigate('/tasks?filter=overdue');
    } else if (notif.type === 'reminder') {
      navigate('/tasks?filter=today');
    }
    
    setShowNotifications(false);
    fetchNotifications();
  };

  // Get icon for notification type
  const getNotifIcon = (type) => {
    switch (type) {
      case 'friend_request': return '👋';
      case 'friend_accepted': return '🤝';
      case 'bump': return '👊';
      case 'reminder': return '📅';
      case 'overdue': return '⚠️';
      case 'completed': return '✅';
      default: return '🔔';
    }
  };

  // Format time ago
  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <span className="header-date">{dateStr}</span>
      </div>
      <div className="header-right">
        <div className="notification-wrapper" ref={notifRef}>
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
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={handleMarkAllRead}>Mark all read</button>
                )}
              </div>
              <div className="notification-list">
                {loading ? (
                  <div className="notification-loading">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="notification-empty">
                    <span>🔔</span>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.isRead ? 'unread' : ''} ${notif.type === 'friend_request' ? 'has-actions' : ''}`}
                    >
                      <span className="notification-icon">{getNotifIcon(notif.type)}</span>
                      <div 
                        className="notification-content"
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <p className="notification-message">{notif.message}</p>
                        <span className="notification-time">{timeAgo(notif.createdAt)}</span>
                      </div>
                      {notif.type === 'friend_request' && !notif.isRead && (
                        <div className="notification-actions">
                          <button 
                            className="notif-accept-btn"
                            onClick={(e) => { e.stopPropagation(); handleAcceptFriend(notif); }}
                          >
                            ✓
                          </button>
                          <button 
                            className="notif-reject-btn"
                            onClick={(e) => { e.stopPropagation(); handleRejectFriend(notif); }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
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

// Toast Notification Component
const ToastContainer = ({ toasts, setToasts }) => {
  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'friend_request' && '👋'}
              {toast.type === 'friend_accepted' && '🤝'}
              {toast.type === 'bump' && '👊'}
              {toast.type === 'reminder' && '📅'}
              {toast.type === 'overdue' && '⚠️'}
            </span>
            <p className="toast-message">{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => dismissToast(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
};

const RequireAuth = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  
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
        <TopHeader toasts={toasts} setToasts={setToasts} />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
      <ToastContainer toasts={toasts} setToasts={setToasts} />
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
          <Route path="/friends" element={<Friends />} />
          <Route path="/user/:username" element={<UserProfile />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
