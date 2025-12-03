import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';

function Profile() {
  // User data state
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '', username: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit mode states
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Preferences state (stored in localStorage for persistence)
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      notifications: true,
    };
  });

  // Fetch user data from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userApi.getMe();
        setUser(res.data);
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (err) {
        console.error('Error fetching user:', err);
        // Fall back to localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Apply theme when it changes
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (preferences.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [preferences.theme]);

  const handleThemeChange = (e) => {
    setPreferences(prev => ({ ...prev, theme: e.target.value }));
  };

  const handleNotificationsToggle = () => {
    setPreferences(prev => ({ ...prev, notifications: !prev.notifications }));
  };

  // Start editing a field
  const startEdit = (field, value) => {
    setEditingField(field);
    setEditValue(value || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  // Save field changes
  const saveField = async () => {
    setError('');
    setSaving(true);

    try {
      let updateData = {};

      if (editingField === 'firstName') {
        if (!editValue.trim()) {
          setError('First name cannot be empty');
          setSaving(false);
          return;
        }
        updateData = { firstName: editValue.trim() };
      } else if (editingField === 'lastName') {
        updateData = { lastName: editValue.trim() };
      } else if (editingField === 'email') {
        if (!editValue.trim()) {
          setError('Email cannot be empty');
          setSaving(false);
          return;
        }
        if (!currentPassword) {
          setError('Current password required to change email');
          setSaving(false);
          return;
        }
        updateData = { email: editValue.trim(), currentPassword };
      } else if (editingField === 'password') {
        if (!currentPassword) {
          setError('Current password is required');
          setSaving(false);
          return;
        }
        if (newPassword.length < 8) {
          setError('New password must be at least 8 characters');
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match');
          setSaving(false);
          return;
        }
        updateData = { currentPassword, newPassword };
      }

      const res = await userApi.updateProfile(updateData);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Profile updated successfully!');
      cancelEdit();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0] || 'Failed to update profile';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const initials = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || 'User';

  if (loading) {
    return (
      <div className="Profile page">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

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

      {/* Messages */}
      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      <div className="settings-section">
        <h2>Account Information</h2>
        
        {/* First Name */}
        <div className="settings-item">
          <span className="settings-label">First Name</span>
          {editingField === 'firstName' ? (
            <div className="settings-edit-inline">
              <input 
                type="text" 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)}
                className="settings-input"
                autoFocus
              />
              <button className="save-btn" onClick={saveField} disabled={saving}>
                {saving ? '...' : 'Save'}
              </button>
              <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <div className="settings-value-row">
              <span className="settings-value">{user.firstName || '—'}</span>
              <button className="edit-btn" onClick={() => startEdit('firstName', user.firstName)}>Edit</button>
            </div>
          )}
        </div>
        
        {/* Last Name */}
        <div className="settings-item">
          <span className="settings-label">Last Name</span>
          {editingField === 'lastName' ? (
            <div className="settings-edit-inline">
              <input 
                type="text" 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)}
                className="settings-input"
                autoFocus
              />
              <button className="save-btn" onClick={saveField} disabled={saving}>
                {saving ? '...' : 'Save'}
              </button>
              <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <div className="settings-value-row">
              <span className="settings-value">{user.lastName || '—'}</span>
              <button className="edit-btn" onClick={() => startEdit('lastName', user.lastName)}>Edit</button>
            </div>
          )}
        </div>

        {/* Username (read-only) */}
        <div className="settings-item">
          <span className="settings-label">Username</span>
          <span className="settings-value">@{user.username || '—'}</span>
        </div>
        
        {/* Email */}
        <div className="settings-item">
          <span className="settings-label">Email</span>
          {editingField === 'email' ? (
            <div className="settings-edit-block">
              <input 
                type="email" 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)}
                className="settings-input"
                placeholder="New email"
                autoFocus
              />
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="settings-input"
                placeholder="Current password (required)"
              />
              <div className="settings-edit-buttons">
                <button className="save-btn" onClick={saveField} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Email'}
                </button>
                <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="settings-value-row">
              <span className="settings-value">{user.email || '—'}</span>
              <button className="edit-btn" onClick={() => startEdit('email', user.email)}>Edit</button>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="settings-item">
          <span className="settings-label">Password</span>
          {editingField === 'password' ? (
            <div className="settings-edit-block">
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="settings-input"
                placeholder="Current password"
                autoFocus
              />
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="settings-input"
                placeholder="New password (min 8 characters)"
              />
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="settings-input"
                placeholder="Confirm new password"
              />
              <div className="settings-edit-buttons">
                <button className="save-btn" onClick={saveField} disabled={saving}>
                  {saving ? 'Saving...' : 'Change Password'}
                </button>
                <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="settings-value-row">
              <span className="settings-value">••••••••</span>
              <button className="edit-btn" onClick={() => startEdit('password', '')}>Change</button>
            </div>
          )}
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
          </button>
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