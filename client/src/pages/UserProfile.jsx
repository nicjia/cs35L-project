import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi, friendsApi, bumpsApi } from '../services/api';

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [bumpingTask, setBumpingTask] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userApi.getProfile(username);
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setActionLoading(true);
    try {
      await friendsApi.sendRequest(username);
      setSuccessMessage('Friend request sent!');
      loadProfile(); // Refresh to update status
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setActionLoading(true);
    try {
      await friendsApi.acceptRequest(profile.friendshipId);
      setSuccessMessage('Friend request accepted!');
      loadProfile();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    setActionLoading(true);
    try {
      await friendsApi.removeFriend(profile.friendshipId);
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove friend');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBump = async (taskId, taskTitle) => {
    setBumpingTask(taskId);
    try {
      await bumpsApi.sendBump(taskId);
      setSuccessMessage(`Bumped "${taskTitle}"! They'll get a notification.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send bump');
    } finally {
      setBumpingTask(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Urgent': return 'priority-urgent';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  if (loading) {
    return (
      <div className="UserProfile page">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="UserProfile page">
        <div className="error-state">
          <h2>User not found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/friends')}>Back to Friends</button>
        </div>
      </div>
    );
  }

  const { user, friendshipStatus, stats, publicTasks } = profile;

  return (
    <div className="UserProfile page">
      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Profile Header */}
      <div className="profile-header-card">
        <button className="back-btn" onClick={() => navigate('/friends')}>
          ← Back to Friends
        </button>
        
        <div className="profile-main">
          <div className="profile-avatar-large">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-details">
            <h1>{user.firstName} {user.lastName}</h1>
            <p className="username">@{user.username}</p>
            <p className="member-since">
              Member since {formatDate(user.memberSince)}
            </p>
          </div>
        </div>

        {/* Friend Action Button */}
        <div className="profile-actions">
          {friendshipStatus === 'none' && (
            <button 
              className="add-friend-btn large"
              onClick={handleSendRequest}
              disabled={actionLoading}
            >
              {actionLoading ? 'Sending...' : '+ Send Friend Request'}
            </button>
          )}
          {friendshipStatus === 'pending_sent' && (
            <button className="pending-btn" disabled>
              ⏳ Request Pending
            </button>
          )}
          {friendshipStatus === 'pending_received' && (
            <button 
              className="accept-btn large"
              onClick={handleAcceptRequest}
              disabled={actionLoading}
            >
              {actionLoading ? 'Accepting...' : '✓ Accept Friend Request'}
            </button>
          )}
          {friendshipStatus === 'friends' && (
            <div className="friend-actions">
              <span className="friends-badge">✓ Friends</span>
              <button 
                className="remove-btn"
                onClick={handleRemoveFriend}
                disabled={actionLoading}
              >
                Remove Friend
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{stats.publicTasks}</span>
            <span className="stat-label">Public Tasks</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.completedTasks}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {stats.publicTasks > 0 
                ? Math.round((stats.completedTasks / stats.publicTasks) * 100) 
                : 0}%
            </span>
            <span className="stat-label">Completion Rate</span>
          </div>
        </div>
      </div>

      {/* Public Tasks Section */}
      <div className="public-tasks-section">
        <h2>Public Tasks</h2>
        
        {publicTasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <h3>No public tasks</h3>
            <p>{user.firstName} hasn't shared any tasks publicly yet.</p>
          </div>
        ) : (
          <div className="public-tasks-list">
            {publicTasks.map(task => (
              <div key={task.id} className={`public-task-card ${task.done ? 'completed' : ''}`}>
                <div className="task-main">
                  <div className="task-status">
                    {task.done ? '✓' : '○'}
                  </div>
                  <div className="task-content">
                    <span className={`task-title ${task.done ? 'done' : ''}`}>
                      {task.title}
                    </span>
                    <div className="task-meta">
                      <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="due-date">
                          📅 {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Bump button - only for friends and incomplete tasks */}
                {friendshipStatus === 'friends' && !task.done && (
                  <button 
                    className="bump-btn"
                    onClick={() => handleBump(task.id, task.title)}
                    disabled={bumpingTask === task.id}
                    title="Send a friendly reminder"
                  >
                    {bumpingTask === task.id ? '...' : '👊 Bump'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Not friends message */}
        {friendshipStatus !== 'friends' && publicTasks.length > 0 && (
          <div className="friends-only-notice">
            <p>💡 Become friends to send bump reminders on tasks!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
