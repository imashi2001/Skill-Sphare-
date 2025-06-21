import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Modal, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button as MuiButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Videocam, Image, Article, MoreVert, WarningAmber as WarningAmberIcon, DeleteForever as DeleteForeverIcon, Cancel as CancelIcon, VideoCameraFront, PhotoLibrary, Create, AccountCircle } from '@mui/icons-material';
import PostCreate from './PostCreate';
import PostUpdate from './PostUpdate';
import avatar from '../../assets/avatar.png';
import { ThumbsUp, MessageCircle, Bookmark, Heart, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import CommentDrawer from '../Interactivity&Engagement/CommentDrawer';

const categoriesFromProps = [
  'Technology',
  'Science',
  'Art',
  'Music',
  'Sports',
  'Education',
  'Other',
];
const categories = ['All', ...categoriesFromProps];

const reactionEmojis = [
  { icon: <ThumbsUp className="text-blue-500 w-6 h-6" />, label: 'Like' },
  { icon: <Heart className="text-red-500 w-6 h-6" />, label: 'Love' },
  { icon: <Lightbulb className="text-yellow-400 w-6 h-6" />, label: 'Insightful' },
];

// Define category colors map
const categoryColors = {
  Technology: 'bg-blue-100 text-blue-700',
  Science: 'bg-emerald-100 text-emerald-700',
  Art: 'bg-purple-100 text-purple-700',
  Music: 'bg-pink-100 text-pink-700',
  Sports: 'bg-orange-100 text-orange-700',
  Education: 'bg-amber-100 text-amber-700',
  Other: 'bg-slate-100 text-slate-700',
  All: 'bg-gray-200 text-gray-800',
  default: 'bg-gray-100 text-gray-700' // Fallback
};

const Posts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPost, setCurrentPost] = useState({
    title: '',
    content: '',
    category: '',
  });
  const [user, setUser] = useState({
    name: 'User Name',
    location: 'Location',
    avatar: avatar,
    userId: null,
  });
  const [openModal, setOpenModal] = useState(false);
  const [likePopupIdx, setLikePopupIdx] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [commentDrawerPostId, setCommentDrawerPostId] = useState(null);
  const [reactions, setReactions] = useState({});
  const [comments, setComments] = useState({});
  const [userReactions, setUserReactions] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to access posts');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }

    let userName = 'User Name';
    let userLocation = 'Location';
    let currentUserId = null;
    let userAvatar = avatar;

    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userObj = JSON.parse(userDataString);
        if (userObj.name) {
          userName = userObj.name;
        }
        if (userObj.userId) {
          currentUserId = userObj.userId;
        }
        const city = userObj.city;
        const country = userObj.country;
        if (city && country) {
          userLocation = `${city}, ${country}`;
        } else if (city) {
          userLocation = city;
        } else if (country) {
          userLocation = country;
        }
        if (userObj.profileImage) {
            const imageName = userObj.profileImage.startsWith('/') ? userObj.profileImage.substring(1) : userObj.profileImage;
            userAvatar = `http://localhost:8080/api/media/files/${imageName}`; 
        } else if (userObj.avatarUrl) {
            userAvatar = userObj.avatarUrl;
        }
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }

    setUser((prevUser) => ({ 
      ...prevUser, 
      name: userName,
      location: userLocation,
      userId: currentUserId,
      avatar: userAvatar,
    }));
    
    fetchPosts(token, activeCategory);
  }, [navigate, activeCategory]);

  const fetchPosts = async (token, categoryToFetch) => {
    try {
      setLoading(true);
      let url = 'http://localhost:8080/api/posts';
      if (categoryToFetch && categoryToFetch !== 'All') {
        url = `http://localhost:8080/api/posts/category/${categoryToFetch}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
      setError(null);
    } catch (error) {
      if (categoryToFetch && categoryToFetch !== 'All' && error.response && error.response.status === 404) {
        setPosts([]);
        setError(null);
      } else {
        setPosts([]);
        setError('Failed to fetch posts. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to create posts');
        setTimeout(() => {
          navigate('/');
        }, 2000);
        return;
      }
      const formData = new FormData();
      formData.append('title', currentPost.title);
      formData.append('content', currentPost.content);
      formData.append('category', currentPost.category);
      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('mediaType', selectedFile.type.startsWith('image/') ? 'IMAGE' : 'VIDEO');
      }
      await axios.post(
        `http://localhost:8080/api/posts`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        }
      );
      setSuccess('Post created successfully!');
      setCurrentPost({ title: '', content: '', category: '' });
      setSelectedFile(null);
      setPreviewUrl('');
      fetchPosts(token, activeCategory);
    } catch (error) {
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to delete posts');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Post deleted successfully!');
      fetchPosts(token, activeCategory);
    } catch (error) {
      setError('Failed to delete post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  // Add a handler to refresh posts after post creation
  const handlePostCreated = () => {
    const token = localStorage.getItem('token');
    if (token) fetchPosts(token, activeCategory);
    setOpenModal(false);
  };

  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setOpenMenuPostId(postId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMenuPostId(null);
  };

  const handleEditClick = (post) => {
    setPostToEdit(post);
    setIsEditModalOpen(true);
    handleMenuClose(); // Close the MoreVert menu
  };

  const handlePostUpdated = () => {
    setIsEditModalOpen(false);
    setPostToEdit(null);
    setSuccess('Post updated successfully!');
    const token = localStorage.getItem('token');
    if (token) fetchPosts(token, activeCategory); // Refresh posts list
  };

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    fetchPosts(localStorage.getItem('token'), categoryName);
  };

  // Enhanced background - slightly less busy
  const backgroundStyle = {
    background: 'radial-gradient(circle at top left, #e0f2fe 10%, #f3e8ff 60%, #e6f7f0 100%)'
  };

  // Fetch reactions for a post
  const fetchReactions = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/reactions/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allReactions = response.data || [];
      setReactions(prev => ({ ...prev, [postId]: allReactions }));
      // Track current user's reaction
      const userId = JSON.parse(localStorage.getItem('user'))?.userId;
      const userReactionObj = allReactions.find(r => r.userId === userId);
      setUserReactions(prev => ({ ...prev, [postId]: userReactionObj || null }));
    } catch (error) {
      setReactions(prev => ({ ...prev, [postId]: [] }));
      setUserReactions(prev => ({ ...prev, [postId]: null }));
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/comments/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const commentList = response.data?._embedded?.commentDTOList || [];
      setComments(prev => ({ ...prev, [postId]: commentList }));
    } catch (error) {
      setComments(prev => ({ ...prev, [postId]: [] }));
    }
  };

  // When opening the comment drawer, also fetch reactions and comments
  const handleCommentDrawerToggle = (postId) => {
    const newPostId = postId === commentDrawerPostId ? null : postId;
    setCommentDrawerPostId(newPostId);
    if (newPostId) {
      fetchComments(newPostId);
      fetchReactions(newPostId);
    }
  };

  // Add reaction handler
  const handleAddReaction = async (postId, newReactionType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to react.');
      return;
    }

    const currentUserId = JSON.parse(localStorage.getItem('user'))?.userId;
    if (!currentUserId) {
        setError('User information not found. Please login again.');
        return;
    }

    // Find the post to check its owner
    const targetPost = posts.find(p => p.postId === postId);
    if (targetPost && targetPost.userId === currentUserId) {
        setError('You cannot react to your own post.');
        return;
    }

    // Store original state for potential rollback
    const originalUserReactionForPost = userReactions[postId] ? { ...userReactions[postId] } : null;
    const originalReactionsForPost = reactions[postId] ? reactions[postId].map(r => ({...r})) : []; // Deep copy for rollback

    let optimisticUserReaction = null;
    let optimisticSuccessMessage = '';

    // --- Optimistic UI Update Start ---
    if (userReactions[postId]) { // User has an existing reaction
      if (userReactions[postId].reactionType === newReactionType) { // Clicking the same reaction to remove it
        optimisticUserReaction = null;
        setUserReactions(prev => ({ ...prev, [postId]: null }));
        setReactions(prev => {
            const postReactions = prev[postId] || [];
            return { ...prev, [postId]: postReactions.filter(r => r.userId !== currentUserId) };
        });
        optimisticSuccessMessage = 'Reaction removed.';
      } else { // Clicking a different reaction to update
        // Use the existing reactionId if available for the optimistic object
        const existingReactionId = userReactions[postId].reactionId;
        optimisticUserReaction = { userId: currentUserId, postId, reactionType: newReactionType, reactionId: existingReactionId || Date.now() }; // Use existing ID or temp
        setUserReactions(prev => ({ ...prev, [postId]: optimisticUserReaction }));
        setReactions(prev => {
            const postReactions = prev[postId] || [];
            const reactionExistsInArray = postReactions.some(r => r.userId === currentUserId);
            if (reactionExistsInArray) {
                return { ...prev, [postId]: postReactions.map(r => r.userId === currentUserId ? optimisticUserReaction : r) };
            } else {
                 // If for some reason it wasn't in the main array but was in userReactions, add it
                return { ...prev, [postId]: [...postReactions, optimisticUserReaction] };
            }
        });
        optimisticSuccessMessage = 'Reaction updated.';
      }
    } else { // No existing reaction, adding a new one
      optimisticUserReaction = { userId: currentUserId, postId, reactionType: newReactionType, reactionId: Date.now() }; // temp ID for optimistic update
      setUserReactions(prev => ({ ...prev, [postId]: optimisticUserReaction }));
      setReactions(prev => {
          const postReactions = prev[postId] || [];
          return { ...prev, [postId]: [...postReactions, optimisticUserReaction] };
      });
      optimisticSuccessMessage = 'Reaction added.';
    }
    setSuccess(optimisticSuccessMessage); // Show success message immediately
    // --- Optimistic UI Update End ---

    try {
      if (originalUserReactionForPost) {
        // User had an existing reaction
        if (originalUserReactionForPost.reactionType === newReactionType) {
          // Clicked the same reaction again - remove it
          await axios.delete(`http://localhost:8080/api/reactions/${originalUserReactionForPost.reactionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          // Clicked a different reaction - update it
          await axios.put(
            `http://localhost:8080/api/reactions/${originalUserReactionForPost.reactionId}?newReactionType=${newReactionType}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        // No existing reaction - add new one
        const response = await axios.post(
          'http://localhost:8080/api/reactions',
          { postId, reactionType: newReactionType }, // userId will be taken from token on backend
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const actualCreatedReaction = response.data; // Contains the real ID from the server

        // Immediately update state with the actual created reaction data
        setUserReactions(prev => ({
          ...prev,
          [postId]: actualCreatedReaction
        }));
        // Replace the optimistic reaction (with temp ID) with the actual one from the server
        setReactions(prev => {
          const currentPostReactions = prev[postId] || [];
          const updatedPostReactions = currentPostReactions.filter(
            r => r.reactionId !== optimisticUserReaction.reactionId // optimisticUserReaction has the temp Date.now() ID
          );
          return { ...prev, [postId]: [...updatedPostReactions, actualCreatedReaction] };
        });
      }
      // Successfully updated backend, now fetch the true state to ensure consistency and get actual reactionId
      fetchReactions(postId);
    } catch (error) {
      console.error("Failed to update reaction:", error.response || error);
      setError(error.response?.data?.message || error.response?.data?.error || 'Failed to update reaction.');
      
      // --- Rollback Optimistic Update On Error ---
      setUserReactions(prev => ({ ...prev, [postId]: originalUserReactionForPost }));
      setReactions(prev => ({...prev, [postId]: originalReactionsForPost}));
      setSuccess(null); // Clear optimistic success message
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={backgroundStyle}>
      <div className="container mx-auto pt-6 md:pt-8 px-2 sm:px-4 flex flex-col md:flex-row gap-4 md:gap-6 flex-1 mb-12">
        {/* Left Sidebar - Enhanced */}
        <aside className="w-full md:w-1/4 lg:w-1/5 space-y-6">
          {/* User Profile Card - Enhanced */}
          <div className="bg-white rounded-lg shadow-md p-5 text-center transition-shadow hover:shadow-lg">
            <img src={user.avatar} alt="User avatar" className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-blue-500 p-0.5" />
            <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{user.location}</p>
            <MuiButton 
              variant="contained" 
              size="small" 
              sx={{ borderRadius: '20px', textTransform: 'none', px: 3, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }}}
              onClick={() => navigate('/profile')}
            >
              View Profile
            </MuiButton>
          </div>

          {/* Categories Section - Enhanced */}
          <div className="bg-white rounded-lg shadow-md p-5 transition-shadow hover:shadow-lg">
            <h4 className="font-semibold text-gray-700 mb-3 text-md">Categories</h4>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400
                      ${activeCategory === cat
                        ? 'bg-blue-500 text-white font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6 md:w-1/2 lg:w-3/5">
          {/* Post Creation Trigger - Enhanced */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt="avatar" className="w-11 h-11 rounded-full" />
              <div
                className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-500 cursor-pointer hover:bg-gray-200 transition text-sm"
                onClick={() => setOpenModal(true)}
              >
                What's on your mind, {user.name.split(' ')[0]}?
              </div>
            </div>
            <div className="flex justify-around mt-4 pt-3 border-t border-gray-200">
              <MuiButton startIcon={<VideoCameraFront />} onClick={() => setOpenModal(true)} sx={{color: 'action.active', textTransform: 'none', fontSize: '0.875rem'}}>Video</MuiButton>
              <MuiButton startIcon={<PhotoLibrary />} onClick={() => setOpenModal(true)} sx={{color: 'action.active', textTransform: 'none', fontSize: '0.875rem'}}>Photo</MuiButton>
              <MuiButton startIcon={<Create />} onClick={() => setOpenModal(true)} sx={{color: 'action.active', textTransform: 'none', fontSize: '0.875rem'}}>Article</MuiButton>
            </div>
          </div>
          <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="create-post-modal">
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto outline-none">
                <PostCreate onClose={handlePostCreated} />
              </div>
          </Modal>

          {/* Posts Feed */}
          {loading && (
            <div className="text-center py-12">
              <CircularProgress />
              <p className="text-gray-600 mt-2">Loading posts...</p>
            </div>
          )}
          {!loading && posts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md p-6">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-lg text-gray-500">
                {activeCategory === 'All' ? 'No posts to show yet.' : `No posts in "${activeCategory}".`}
              </p>
              <p className="text-sm text-gray-400 mt-1">Why not create one or try a different category?</p>
            </div>
          )}
          {!loading && posts.length > 0 && (
            <div className="space-y-6 mb-8 max-w-3xl mx-auto">
              {posts.map((post, idx) => {
                const hasMedia = post.mediaList && post.mediaList.length > 0;
                return (
                  <article key={post.postId} className="bg-white rounded-lg shadow-md border border-gray-200/80 overflow-hidden transition-shadow hover:shadow-xl">
                    <div className="p-4 sm:p-5">
                      <header className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          <img 
                            src={post.authorProfileImage ? `http://localhost:8080/api/media/files/${post.authorProfileImage.startsWith('/') ? post.authorProfileImage.substring(1) : post.authorProfileImage}` : avatar} 
                            alt={post.authorName || 'Author'} 
                            className="w-10 h-10 rounded-full flex-shrink-0 mt-0.5"
                          />
                          <div className="flex-grow">
                            <h2 className="font-semibold text-gray-800 text-md leading-tight">{post.title}</h2>
                            <div className="text-xs text-gray-500 flex items-center flex-wrap gap-x-2 gap-y-1 mt-0.5">
                              <span>By {post.authorName || 'Unknown Author'}</span>
                              <span className="text-gray-400">•</span>
                              <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                              <span 
                                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[post.category] || categoryColors.default}`}
                              >
                                {post.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="relative flex-shrink-0 ml-2">
                          <MuiButton 
                            size="small" 
                            aria-label="options" 
                            id={`post-options-button-${post.postId}`}
                            onClick={(e) => handleMenuOpen(e, post.postId)} 
                            sx={{minWidth: 'auto', padding: '4px', color: 'text.secondary', marginTop: '-4px'}}
                          >
                            <MoreVert fontSize="small" />
                          </MuiButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={openMenuPostId === post.postId}
                            onClose={handleMenuClose}
                            aria-labelledby={`post-options-button-${post.postId}`}
                            slotProps={{ 
                              paper: { 
                                elevation: 0, 
                                sx: { 
                                  overflow: 'visible', 
                                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))', 
                                  mt: 0.5, 
                                  borderRadius: '8px', 
                                  '&:before': { 
                                    content: '""', 
                                    display: 'block', 
                                    position: 'absolute', 
                                    top: 0, 
                                    right: 14, 
                                    width: 10, 
                                    height: 10, 
                                    bgcolor: 'background.paper', 
                                    transform: 'translateY(-50%) rotate(45deg)', 
                                    zIndex: 0
                                  }
                                }
                              }
                            }}
                          >
                            <MenuItem onClick={() => { setPostIdToDelete(post.postId); setDeleteDialogOpen(true); handleMenuClose(); }} sx={{fontSize: '0.875rem'}}>
                              <DeleteIcon fontSize="small" sx={{mr:1}} /> Delete
                            </MenuItem>
                            <MenuItem onClick={() => handleEditClick(post)} sx={{fontSize: '0.875rem'}}>
                              <EditIcon fontSize="small" sx={{mr:1}} /> Edit
                            </MenuItem>
                          </Menu>
                        </div>
                      </header>

                      <div className="text-gray-700 text-sm mb-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
                       {/* Hashtags - more subtle */}
                        {post.hashtags && post.hashtags.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-1">
                                {post.hashtags.map((tag, tagIdx) => (
                                <span key={tagIdx} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:bg-blue-100">
                                    #{tag}
                                </span>
                                ))}
                            </div>
                        )}


                      {/* Media Section - Simplified to show only the first media item prominently for now */}
                      {hasMedia && post.mediaList[0] && (
                        <div className="my-3 rounded-lg overflow-hidden border border-gray-200">
                          {post.mediaList[0].mediaType === 'VIDEO' ? (
                            <video src={post.mediaList[0].mediaUrl} controls className="w-full max-h-[400px] object-contain bg-gray-100" />
                          ) : (
                            <img src={post.mediaList[0].mediaUrl} alt={post.title} className="w-full max-h-[400px] object-contain bg-gray-100" />
                          )}
                        </div>
                      )}
                      {/* TODO: Add a gallery view for multiple media items if needed */}


                      {/* Actions Bar - Enhanced */}
                      <div className="border-t border-gray-200 pt-2.5 mt-3 relative">
                        <div className="flex justify-around items-center text-gray-600">
                          <div className="relative flex items-center gap-1.5">
                            <button
                              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-gray-100 text-sm transition-colors group ${userReactions[post.postId]?.reactionType === 'LIKE' ? 'text-blue-600 font-bold' : ''}`}
                              onMouseEnter={() => setLikePopupIdx(idx)}
                              onMouseLeave={() => setLikePopupIdx(null)}
                              onClick={() => handleAddReaction(post.postId, 'LIKE')}
                            >
                              <ThumbsUp className="w-4 h-4 text-gray-500 group-hover:text-blue-500" /> <span className="group-hover:text-blue-500">Like</span>
                              {/* Like/Reaction count */}
                              {Array.isArray(reactions[post.postId]) && reactions[post.postId].length > 0 && (
                                <span className="ml-1 text-xs text-blue-500 font-semibold">{reactions[post.postId].length}</span>
                              )}
                            </button>
                            <AnimatePresence>
                              {likePopupIdx === idx && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                  transition={{ duration: 0.15, ease: "easeOut" }}
                                  className="absolute left-[-55%] -translate-x-1/2 bottom-full mb-3 z-20 flex gap-1 bg-white rounded-xl shadow-xl p-1.5 border border-gray-200 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:w-0 after:h-0 after:border-l-[8px] after:border-l-transparent after:border-r-[8px] after:border-r-transparent after:border-t-[8px] after:border-t-white"
                                  onMouseEnter={() => setLikePopupIdx(idx)}
                                  onMouseLeave={() => setLikePopupIdx(null)}
                                >
                                  {reactionEmojis.map((r, i) => (
                                    <motion.button
                                      key={i}
                                      className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${userReactions[post.postId]?.reactionType === r.label.toUpperCase() ? 'ring-2 ring-blue-400' : ''}`}
                                      whileHover={{ scale: 1.2, y: -3 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                      onClick={() => handleAddReaction(post.postId, r.label.toUpperCase())}
                                    >
                                      {React.cloneElement(r.icon, { className: `${r.icon.props.className} w-5 h-5` })}
                                      <span className="block text-xs mt-1 text-gray-600 group-hover:text-blue-600 font-medium">{r.label}</span>
                                    </motion.button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <button 
                            className="flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-gray-100 text-sm transition-colors group"
                            onClick={() => handleCommentDrawerToggle(post.postId)}
                          >
                            <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-green-500" /> <span className="group-hover:text-green-500">Comment</span>
                            {/* Comment count */}
                            {Array.isArray(comments[post.postId]) && comments[post.postId].length > 0 && (
                              <span className="ml-1 text-xs text-green-500 font-semibold">{comments[post.postId].length}</span>
                            )}
                          </button>
                          <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-gray-100 text-sm transition-colors group">
                            <Bookmark className="w-4 h-4 text-gray-500 group-hover:text-purple-500" /> <span className="group-hover:text-purple-500">Save</span>
                          </button>
                        </div>
                      </div>
                      {/* Inline CommentDrawer Section */}
                      {commentDrawerPostId === post.postId && (
                        <CommentDrawer
                          postId={post.postId}
                          currentUser={{ userId: user.userId, name: user.name, avatar: user.avatar }}
                          postOwnerId={post.userId}
                          onClose={() => setCommentDrawerPostId(null)}
                        />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Sidebar - New */}
        <aside className="w-full md:w-1/4 lg:w-1/5 space-y-6 hidden md:block">
          {/* Trending Hashtags Card */}
          <div className="bg-white rounded-lg shadow-md p-5 transition-shadow hover:shadow-lg">
            <h4 className="font-semibold text-gray-700 mb-3 text-md">Trending Hashtags</h4>
            <ul className="space-y-1">
              {['#innovation', '#reactjs', '#webdev', '#tailwindcss', '#careeradvice'].map((tag) => (
                <li key={tag}>
                  <button
                    className="w-full text-left px-3 py-1.5 rounded-md text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions & Tips Card */}
          <div className="bg-white rounded-lg shadow-md p-5 transition-shadow hover:shadow-lg">
            <h4 className="font-semibold text-gray-700 mb-3 text-md">Quick Actions & Tips</h4>
            <MuiButton 
                variant="outlined" 
                size="small" 
                fullWidth 
                sx={{ mb: 1.5, textTransform: 'none', justifyContent: 'flex-start' }}
                startIcon={<Create />}
                onClick={() => setOpenModal(true)}
            >
                Create New Post
            </MuiButton>
            <MuiButton 
                variant="outlined" 
                size="small" 
                fullWidth 
                sx={{ mb: 1.5, textTransform: 'none', justifyContent: 'flex-start' }}
                startIcon={<AccountCircle className="w-5 h-5" />}
                onClick={() => navigate('/profile')}
            >
                View Your Profile
            </MuiButton>
            <div className="mt-3 border-t pt-3">
                <p className="text-xs text-gray-600">
                    <strong>Tip:</strong> Engage with posts by commenting and reacting to gain visibility!
                </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="error" variant="filled" sx={{ width: '100%', boxShadow: 3 }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled" sx={{ width: '100%', boxShadow: 3 }}>{success}</Alert>
      </Snackbar>

      {/* Edit Post Modal */}
      {postToEdit && (
        <PostUpdate
          open={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setPostToEdit(null); }}
          postData={postToEdit}
          onPostUpdated={handlePostUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'medium' }}>
          <WarningAmberIcon sx={{ color: 'warning.main', fontSize: '2rem' }} />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to permanently delete this post? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 2.5 }}>
          <MuiButton onClick={() => setDeleteDialogOpen(false)} color="inherit" sx={{textTransform: 'none'}}>Cancel</MuiButton>
          <MuiButton
            onClick={async () => { await handleDelete(postIdToDelete); setDeleteDialogOpen(false); }}
            color="error" variant="contained" disableElevation
            startIcon={<DeleteForeverIcon />} sx={{textTransform: 'none', fontWeight: 'medium'}}
          >
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Posts;
