import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, friendsApi } from '../services/api';

function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load friends and requests on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes, sentRes] = await Promise.all([
        friendsApi.getAll(),
        friendsApi.getRequests(),
        friendsApi.getSentRequests(),
      ]);
      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      console.error('Error loading friends data:', err);
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) {
      setError('Search query must be at least 2 characters');
      return;
    }

    setSearching(true);
    setError('');
    try {
      const res = await userApi.search(searchQuery);
      setSearchResults(res.data);
      if (res.data.length === 0) {
        setError('No users found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Send friend request
  const handleSendRequest = async (username) => {
    setError('');
    try {
      await friendsApi.sendRequest(username);
      setSuccessMessage(`Friend request sent to ${username}!`);
      // Refresh sent requests
      const sentRes = await friendsApi.getSentRequests();
      setSentRequests(sentRes.data);
      // Clear search results
      setSearchResults([]);
      setSearchQuery('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    }
  };

  // Accept friend request
  const handleAccept = async (requestId) => {
    try {
      await friendsApi.acceptRequest(requestId);
      setSuccessMessage('Friend request accepted!');
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept request');
    }
  };

  // Reject friend request
  const handleReject = async (requestId) => {
    try {
      await friendsApi.rejectRequest(requestId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request');
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendshipId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    try {
      await friendsApi.removeFriend(friendshipId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove friend');
    }
  };

  // Check if user is already friend or has pending request
  const getUserStatus = (userId) => {
    if (friends.some(f => f.id === userId)) return 'friend';
    if (sentRequests.some(r => r.addressee?.id === userId)) return 'pending_sent';
    if (requests.some(r => r.requester?.id === userId)) return 'pending_received';
    return 'none';
  };

  return (
    <div className="Friends page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Friends</h1>
          <p className="page-description">Connect with others and view their public tasks</p>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Search Section */}
      <div className="friends-search-section">
        <h2>Find Friends</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-large"
          />
          <button type="submit" className="search-btn" disabled={searching}>
            {searching ? 'Searching...' : '🔍 Search'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results</h3>
            <div className="user-list">
              {searchResults.map(user => {
                const status = getUserStatus(user.id);
                return (
                  <div key={user.id} className="user-card">
                    <div className="user-avatar">
                      {user.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.firstName} {user.lastName}</span>
                      <span className="user-username">@{user.username}</span>
                    </div>
                    <div className="user-actions">
                      <button 
                        className="view-profile-btn"
                        onClick={() => navigate(`/user/${user.username}`)}
                      >
                        View Profile
                      </button>
                      {status === 'none' && (
                        <button 
                          className="add-friend-btn"
                          onClick={() => handleSendRequest(user.username)}
                        >
                          + Add Friend
                        </button>
                      )}
                      {status === 'pending_sent' && (
                        <span className="status-badge pending">Request Sent</span>
                      )}
                      {status === 'friend' && (
                        <span className="status-badge friends">✓ Friends</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="friends-tabs">
        <button 
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests ({requests.length})
          {requests.length > 0 && <span className="badge">{requests.length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="friends-content">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : (
          <>
            {/* Friends List */}
            {activeTab === 'friends' && (
              <div className="friends-list">
                {friends.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">👥</span>
                    <h3>No friends yet</h3>
                    <p>Search for users above to send friend requests!</p>
                  </div>
                ) : (
                  <div className="user-list">
                    {friends.map(friend => (
                      <div key={friend.friendshipId} className="user-card">
                        <div className="user-avatar">
                          {friend.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{friend.firstName} {friend.lastName}</span>
                          <span className="user-username">@{friend.username}</span>
                        </div>
                        <div className="user-actions">
                          <button 
                            className="view-profile-btn"
                            onClick={() => navigate(`/user/${friend.username}`)}
                          >
                            View Profile
                          </button>
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveFriend(friend.friendshipId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Friend Requests */}
            {activeTab === 'requests' && (
              <div className="requests-list">
                {requests.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📬</span>
                    <h3>No pending requests</h3>
                    <p>Friend requests you receive will appear here.</p>
                  </div>
                ) : (
                  <div className="user-list">
                    {requests.map(request => (
                      <div key={request.id} className="user-card request-card">
                        <div className="user-avatar">
                          {request.requester.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <span className="user-name">
                            {request.requester.firstName} {request.requester.lastName}
                          </span>
                          <span className="user-username">@{request.requester.username}</span>
                        </div>
                        <div className="user-actions">
                          <button 
                            className="accept-btn"
                            onClick={() => handleAccept(request.id)}
                          >
                            ✓ Accept
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => handleReject(request.id)}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sent Requests */}
            {activeTab === 'sent' && (
              <div className="sent-list">
                {sentRequests.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📤</span>
                    <h3>No sent requests</h3>
                    <p>Friend requests you send will appear here until accepted.</p>
                  </div>
                ) : (
                  <div className="user-list">
                    {sentRequests.map(request => (
                      <div key={request.id} className="user-card">
                        <div className="user-avatar">
                          {request.addressee.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <span className="user-name">
                            {request.addressee.firstName} {request.addressee.lastName}
                          </span>
                          <span className="user-username">@{request.addressee.username}</span>
                        </div>
                        <div className="user-actions">
                          <span className="status-badge pending">Pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Friends;
