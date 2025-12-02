import React from 'react';

function Profile() {
  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { firstName: 'User', lastName: '', email: 'user@example.com' };
  const initials = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || 'User';

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
          <span className="settings-value">Light</span>
        </div>
        <div className="settings-item">
          <span className="settings-label">Notifications</span>
          <span className="settings-value">Enabled</span>
        </div>
        <div className="settings-item">
          <span className="settings-label">Language</span>
          <span className="settings-value">English</span>
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