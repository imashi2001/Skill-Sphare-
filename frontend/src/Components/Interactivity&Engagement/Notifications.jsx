import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, XCircle, Trash2, ExternalLink, Info, User, Settings, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onNavigate }) => {
  const handleItemClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.notificationId);
    }
    if (notification.postId) {
      onNavigate(`/posts/view/${notification.postId}`);
    } else if (notification.commentId) {
      // Assuming a structure where you might want to navigate to a post containing the comment
      // This might need adjustment based on your routing for specific comments
      // For now, let's assume postId is always present if commentId is, or handle separately.
      if (notification.postId) {
         onNavigate(`/posts/view/${notification.postId}#comment-${notification.commentId}`);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
      className={`p-4 mb-3 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${
        notification.isRead ? 'bg-white border-gray-300' : 'bg-blue-50 border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-grow cursor-pointer" onClick={handleItemClick}>
          <div className="flex items-center mb-1">
            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
            )}
            <p className={`text-sm ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
              {notification.message}
            </p>
          </div>
          <p className="text-xs text-gray-500">{notification.createdAt}</p>
        </div>
        <div className="flex-shrink-0 ml-4 flex items-center gap-2">
          {!notification.isRead && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.notificationId); }}
              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors"
              title="Mark as read"
            >
              <CheckCircle size={18} />
            </button>
          )}
          {(notification.postId || notification.commentId) && (
             <button
                onClick={(e) => { e.stopPropagation(); handleItemClick(); }}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                title="View Details"
            >
                <ExternalLink size={18} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notification.notificationId); }}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
            title="Delete notification"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const backgroundStyle = {
  background: 'radial-gradient(circle at top left, #e0f2fe 10%, #f3e8ff 60%, #e6f7f0 100%)'
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication required. Please login.");
        setLoading(false);
        // navigate('/login'); // Optionally redirect
        return;
      }
      const response = await axios.get('http://localhost:8080/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort by date, newest first
      const sortedNotifications = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sortedNotifications);
    } catch (err) {
      setError('Failed to fetch notifications. Please try again later.');
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Mark as read error:", err);
      // Optionally show a specific error to the user
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
    } catch (err) {
      console.error("Delete notification error:", err);
      // Optionally show a specific error to the user
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={backgroundStyle}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Bell size={30} className="mr-3 text-blue-600" />
            Notifications
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Notifications Feed */}
          <main className="lg:w-2/3 w-full">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Unread
                    {unreadCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                           {unreadCount}
                       </span>
                    )}
                  </button>
                </div>
                {/* Add more actions like "Mark all as read" if needed */}
              </div>

              {loading && <p className="text-center text-gray-600 py-10">Loading notifications...</p>}
              {error && <p className="text-center text-red-500 py-10">{error}</p>}
              
              {!loading && !error && (
                <AnimatePresence>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.notificationId}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDeleteNotification}
                        onNavigate={handleNavigate}
                      />
                    ))
                  ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 text-gray-500"
                    >
                      <Info size={40} className="mx-auto mb-2 text-gray-400"/>
                      No {filter === 'unread' ? 'unread' : ''} notifications right now.
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </main>

          {/* Right Column: Sidebar */}
          <aside className="lg:w-1/3 w-full">
            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Hub</h2>
              
              <div className="space-y-3">
                 <p className="text-sm text-gray-600">
                    You have <span className="font-bold text-blue-600">{unreadCount}</span> unread notification{unreadCount === 1 ? '' : 's'}.
                </p>
                
                <button 
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                    <User size={18} className="text-blue-500" /> My Profile
                </button>
                 <button 
                    onClick={() => navigate('/posts')} // Assuming /posts shows user's posts or feed
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                    <FileText size={18} className="text-green-500" /> View Posts
                </button>
                <button 
                    onClick={() => navigate('/settings')} // Assuming a /settings page
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                    <Settings size={18} className="text-purple-500" /> Account Settings
                </button>
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Tips</h3>
                <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                    <li>Click on a notification to view details.</li>
                    <li>Keep your notifications tidy by deleting old ones.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Notifications;