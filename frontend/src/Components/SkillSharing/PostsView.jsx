import React, { useState } from 'react'
import { ThumbsUp, MessageCircle, Bookmark, MoreVertical, Send, X } from 'lucide-react';
import axios from 'axios';
import avatarPlaceholder from '../../assets/avatar.png';
import avatar from '../../assets/avatar.png';
// For later: import { Menu, MenuItem, CircularProgress, Avatar } from '@mui/material';

// Define category colors (can be imported from a shared constants file too)
const categoryColors = {
  Technology: 'bg-sky-100 text-sky-700',
  Science: 'bg-green-100 text-green-700',
  Art: 'bg-purple-100 text-purple-700',
  Music: 'bg-pink-100 text-pink-700',
  Sports: 'bg-orange-100 text-orange-700',
  Education: 'bg-amber-100 text-amber-700',
  Other: 'bg-slate-100 text-slate-700',
  default: 'bg-gray-100 text-gray-700',
};

// API_BASE_URL is not strictly needed here if backend sends full URLs for media
// const API_BASE_URL = 'http://localhost:8080'; 

// Props it will receive:
// - posts: Array of post objects to display
// - loading: Boolean to show loading state
// - error: String to show error message
// - onEditPost: (optional) function to handle editing a post
// - onDeletePost: (optional) function to handle deleting a post
// - onReactToPost: (optional) function to handle reactions
// - onCommentOnPost: (optional) function to handle comments
// - onSavePost: (optional) function to handle saving/unsaving
// - currentUser: (optional) object for checking ownership for edit/delete

function PostsView({ 
    posts = [], 
    loading = false, 
    error = null,
    showAuthorInfo = true,
    currentUserId = null, // ID of the logged-in user
    onOpenMenu,         // Function to call when MoreVertical is clicked: (event, postId) => {}
    mediaMaxHeight = 'max-h-[500px]', // New prop
    // Added props for reaction handling and displaying reactions/comments
    onReactToPost, // (postId, reactionType) => {}
    userReactions = {}, // { [postId]: reactionType } or { [postId]: reactionObject }
}) {
  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});
  const [postReactionsCount, setPostReactionsCount] = useState({}); // To store reaction counts
  const [postCommentsCount, setPostCommentsCount] = useState({}); // To store comment counts

  // Get logged-in user's avatar
  let currentUserAvatar = avatarPlaceholder;
  try {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      const userObj = JSON.parse(userDataString);
      if (userObj.profileImage) {
        const imageName = userObj.profileImage.startsWith('/') ? userObj.profileImage.substring(1) : userObj.profileImage;
        currentUserAvatar = `http://localhost:8080/api/media/files/${imageName}`;
      } else if (userObj.avatarUrl) {
        currentUserAvatar = userObj.avatarUrl;
      }
    }
  } catch (e) {}

  // Function to fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/comments/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Correctly extract comments from Spring HATEOAS CollectionModel
      const commentList = response.data?._embedded?.commentDTOList || [];
      setComments(prev => ({ ...prev, [postId]: commentList }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments(prev => ({ ...prev, [postId]: [] })); // Ensure it's an array on error
    }
  };

  // Function to toggle comments section
  const toggleComments = async (postId) => {
    setExpandedComments(prev => {
      const newState = { ...prev, [postId]: !prev[postId] };
      if (newState[postId]) {
        fetchComments(postId);
      }
      return newState;
    });
  };

  // Function to handle comment submission
  const handleCommentSubmit = async (postId) => {
    if (!newComment[postId]?.trim()) return;

    setIsSubmitting(prev => ({ ...prev, [postId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/comments', {
        content: newComment[postId],
        postId: postId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data]
      }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [postId]: false }));
    }
  };

  if (loading) {
    return <div className="text-center py-10"><p>Loading posts...</p></div>; // Replace with CircularProgress if Material UI is used here
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!posts || posts.length === 0) {
    return <div className="text-center py-10 text-gray-500">No posts to display.</div>;
  }

  // Simplified function to get profile image URL - assuming relative path from DB for user profile images
  // This might need to be passed in or handled by a global utility if UserDTO.profileImage format varies.
  const getUserProfileImageUrl = (profileImagePath) => {
    if (!profileImagePath) return 'https://via.placeholder.com/150?text=User';
    // Use environment variable for API base URL
    const API_BASE_URL_FOR_PROFILE_IMAGES = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
    const cleanPath = profileImagePath.replace(/^\/api\/media\/files\//, '').replace(/^\/+/, '');
    return `${API_BASE_URL_FOR_PROFILE_IMAGES}/api/media/files/${cleanPath}`;
  };

  return (
    <div className="space-y-6"> 
      {posts.map((post, mapIndex) => {
        const hasMedia = post.mediaList && post.mediaList.length > 0;
        const isMultiMedia = hasMedia && post.mediaList.length > 1;
        const postAuthor = post.user; // Assuming post object has a 'user' field { userId, name, profileImage }
                                     // This needs to be populated by the backend in PostDTO
        const isAuthor = currentUserId && post.userId === currentUserId; // Check if current user is the author of THIS post
        const uniquePopupId = post.postId || mapIndex; // Prefer postId, fallback to mapIndex

        const userAvatarUrl = postAuthor?.profileImage 
          ? getUserProfileImageUrl(postAuthor.profileImage)
          : 'https://via.placeholder.com/150?text=User';

        return (
          <div
            key={post.postId || mapIndex}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 md:p-6 transition-shadow hover:shadow-xl group flex flex-col gap-3.5 relative"
          >
            {/* Post Header: Author, Timestamp, Options Menu */} 
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {showAuthorInfo && postAuthor && (
                  <img 
                    src={userAvatarUrl}
                    alt={postAuthor.name || 'User'} 
                    className="w-11 h-11 rounded-full object-cover border border-gray-300"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=U'} // Simpler fallback
                  />
                )}
                <div>
                  {showAuthorInfo && postAuthor && (
                    <div className="font-semibold text-gray-800 text-base leading-tight">{postAuthor.name || 'Unknown User'}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(post.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
              {isAuthor && onOpenMenu && (
                <button 
                  className="text-gray-500 hover:bg-gray-100 rounded-full p-1.5 -mr-1.5 -mt-1" 
                  onClick={(e) => onOpenMenu(e, post.postId)}
                >
                  <MoreVertical size={22} />
                </button>
              )}
            </div>

            {/* Post Content: Title, Text, Category */} 
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 leading-snug">{post.title}</h3>
                <p className="text-gray-700 text-base leading-relaxed break-words whitespace-pre-line">{post.content}</p>
                <div className="flex items-center gap-2 pt-1">
                    <span 
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${categoryColors[post.category] || categoryColors.default}`}
                    >
                        {post.category}
                    </span>
                    {/* Hashtags */} 
                    {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                        {post.hashtags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="text-xs text-blue-600 hover:underline cursor-pointer">
                            #{typeof tag === 'string' ? tag : tag.name} {/* Adapt based on hashtag object structure */}
                            </span>
                        ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Media Section */} 
            {hasMedia && (
              <div className={`mt-3 -mx-5 md:-mx-6 rounded-b-xl overflow-hidden`}> {/* Card edge-to-edge for media */}
                {/* Single main media item */} 
                <div className={isMultiMedia ? 'mb-1' : ''}>
                  {post.mediaList[0].mediaType === 'VIDEO' ? (
                    <video
                      src={post.mediaList[0].mediaUrl}
                      controls
                      className={`w-full ${mediaMaxHeight} object-contain bg-black rounded-t-lg md:rounded-t-xl`} 
                    />
                  ) : (
                    <img
                      src={post.mediaList[0].mediaUrl}
                      alt={`${post.title} - media`}
                      className={`w-full ${mediaMaxHeight} object-contain bg-gray-100 rounded-t-lg md:rounded-t-xl`} 
                    />
                  )}
                </div>
                {/* Thumbnail grid for additional media */} 
                {isMultiMedia && post.mediaList.length > 1 && (
                  <div className={`grid grid-cols-${Math.min(post.mediaList.length -1, 4)} gap-1 px-0.5 pb-0.5`}>
                    {post.mediaList.slice(1).map((mediaItem, mediaIdx) => (
                      <div key={mediaIdx} className="aspect-w-1 aspect-h-1 bg-gray-200">
                        {mediaItem.mediaType === 'VIDEO' ? (
                          <video
                            src={mediaItem.mediaUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={mediaItem.mediaUrl}
                            alt={`${post.title} - media ${mediaIdx + 2}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Post Actions: Like, Comment, Save, Share */} 
            <div className="border-t border-gray-200 pt-3 mt-4">
              <div className="flex justify-around items-center text-gray-600">
                {/* Like Button with Count and Popup */}
                <div className="relative flex items-center">
                  <button
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-gray-100 text-sm transition-colors group ${(userReactions[post.postId] === 'LIKE' || userReactions[post.postId]?.reactionType === 'LIKE') ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
                    onClick={() => onReactToPost && onReactToPost(post.postId, 'LIKE')} 
                    // Removed onMouseEnter and onMouseLeave for popup
                  >
                    <ThumbsUp className={`w-5 h-5 ${(userReactions[post.postId] === 'LIKE' || userReactions[post.postId]?.reactionType === 'LIKE') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'}`} />
                    <span className={`group-hover:text-blue-500 ${(userReactions[post.postId] === 'LIKE' || userReactions[post.postId]?.reactionType === 'LIKE') ? 'text-blue-600' : ''}`}>Like</span>
                    {/* Reaction count display */} 
                    {postReactionsCount[post.postId] !== undefined && postReactionsCount[post.postId] > 0 && (
                        <span className="ml-1 text-xs text-blue-500 font-semibold">
                            {postReactionsCount[post.postId]}
                        </span>
                    )}
                  </button>
                  {/* Removed AnimatePresence and motion.div for reaction emoji popup */}
                </div>

                <button 
                  className="flex items-center gap-1.5 hover:text-green-600 transition rounded-md px-3 py-1.5 hover:bg-green-50"
                  onClick={() => toggleComments(post.postId)}
                >
                  <MessageCircle size={18} /> Comment
                  {/* Comment count */}
                  {Array.isArray(comments[post.postId]) && comments[post.postId].length > 0 && (
                    <span className="ml-1 text-xs text-green-500 font-semibold">{comments[post.postId].length}</span>
                  )}
                </button>
                <button className="flex items-center gap-1.5 hover:text-purple-600 transition rounded-md px-3 py-1.5 hover:bg-purple-50">
                  <Bookmark size={18} /> Save
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-100 pt-4 mt-2">
              {/* Comment Input */}
              <div className="flex gap-3 mb-4">
                <img 
                  src={currentUserAvatar}
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment[post.postId] || ''}
                    onChange={(e) => setNewComment(prev => ({ ...prev, [post.postId]: e.target.value }))}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.postId)}
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.postId)}
                    disabled={isSubmitting[post.postId]}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {(comments[post.postId] || []).map((comment) => {
                  // Use backend-provided fields for name and avatar
                  const commenterName = comment.commenterUsername || 'Unknown User';
                  const commenterAvatarUrl = comment.commenterAvatarUrl
                    ? `http://localhost:8080/api/media/files/${comment.commenterAvatarUrl.startsWith('/') ? comment.commenterAvatarUrl.substring(1) : comment.commenterAvatarUrl}`
                    : avatarPlaceholder;
                  const canDelete = currentUserId === comment.userId;
                  return (
                    <div
                      key={comment.commentId}
                      className="flex gap-3"
                    >
                      <img 
                        src={commenterAvatarUrl}
                        alt={commenterName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-2xl px-4 py-2">
                          <div className="font-medium text-sm text-gray-900">
                            {commenterName}
                          </div>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 px-2">
                          <span className="text-xs text-gray-500">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                          </span>
                          {/* Delete button for comment owner */}
                          {canDelete && (
                            <button
                              className="text-xs text-red-500 hover:text-red-600"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this comment?')) {
                                  try {
                                    const token = localStorage.getItem('token');
                                    await axios.delete(`http://localhost:8080/api/comments/${comment.commentId}`, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    // Refresh comments
                                    const response = await axios.get(`http://localhost:8080/api/comments/post/${post.postId}`, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    const commentList = response.data?._embedded?.commentDTOList || [];
                                    setComments(prev => ({ ...prev, [post.postId]: commentList }));
                                  } catch (err) {
                                    alert('Failed to delete comment.');
                                  }
                                }
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PostsView
