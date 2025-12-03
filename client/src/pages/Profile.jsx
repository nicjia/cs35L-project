import React, { useState, useEffect } from 'react';

function Profile() {
  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { firstName: 'User', lastName: '', email: 'user@example.com' };
  const initials = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || 'User';

  // Preferences state (stored in localStorage for persistence)
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      notifications: true,
      language: 'en',
    };
  });

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const handleThemeChange = (e) => {
    setPreferences(prev => ({ ...prev, theme: e.target.value }));
  };

  const handleNotificationsToggle = () => {
    setPreferences(prev => ({ ...prev, notifications: !prev.notifications }));
  };

  const handleLanguageChange = (e) => {
    setPreferences(prev => ({ ...prev, language: e.target.value }));
  };

  const themeLabels = { light: 'Light', dark: 'Dark', system: 'System' };
  const languageLabels = { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' };

  return (
    <div className="Profile page">
      <div className="profile-header">
        <div className="profile-avatar-large">{initials}</div>
        <div className="profile-details">
          <h1>{fullName}</h1>
          <p>{user.email}</p>
          <p>@{user.username || 'username'}</p>
        </div>
      </div>

      <div className="settings-section">
        <h2>Account Information</h2>
        <div className="settings-item">
          <span className="settings-label">First Name</span>
          <span className="settings-value">{user.firstName || '—'}</span>
        </div>
        <div className="settings-item">
          <span className="settings-label">Last Name</span>
          <span className="settings-value">{user.lastName || '—'}</span>
        </div>
        <div className="settings-item">
          <span className="settings-label">Username</span>
          <span className="settings-value">@{user.username || '—'}</span>
        </div>
        <div className="settings-item">
          <span className="settings-label">Email</span>
          <span className="settings-value">{user.email || '—'}</span>
        </div>
      </div>

      <div className="settings-section">
        <h2>Preferences</h2>
        <div className="settings-item">
          <span className="settings-label">Theme</span>
          <select 
            className="settings-select"
            value={preferences.theme}
            onChange={handleThemeChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="settings-item">
          <span className="settings-label">Notifications</span>
          <button
            className={`settings-toggle ${preferences.notifications ? 'active' : ''}`}
            onClick={handleNotificationsToggle}
            aria-pressed={preferences.notifications}
          >
            <span className="toggle-slider"></span>
            <span className="toggle-label">{preferences.notifications ? 'On' : 'Off'}</span>
          </button>
        </div>
        <div className="settings-item">
          <span className="settings-label">Language</span>
          <select
            className="settings-select"
            value={preferences.language}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h2>About</h2>
        <div className="settings-item">
          <span className="settings-label">Version</span>
          <span className="settings-value">1.0.0</span>
        </div>
        <div className="settings-item">
          <span className="settings-label">Built with</span>
          <span className="settings-value">React + Express</span>
        </div>
      </div>
    </div>
  );
}

export default Profile;