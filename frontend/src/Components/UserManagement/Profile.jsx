import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Camera, Edit3, MapPin, Users, Heart, UserCircle, Mail, Phone, Calendar, Briefcase, Home, X, Edit as EditIconLucide, Trash2 as DeleteIconLucide } from 'lucide-react'; // Added X for close icon
import Swal from 'sweetalert2'; // For nicer alerts
import PostsView from '../SkillSharing/PostsView'; // Import PostsView
import PostUpdate from '../SkillSharing/PostUpdate'; // Import PostUpdate
import { Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material'; // MUI components

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editableUserData, setEditableUserData] = useState({});
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState('');

  // State for Post Menu, Edit Modal, Delete Dialog
  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);
  const [isPostUpdateModalOpen, setIsPostUpdateModalOpen] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const API_BASE_URL = 'http://localhost:8080';

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
      setEditableUserData(response.data); // Initialize editable data
      setError('');
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError('Failed to fetch user data. Please try again later.');
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (userId) => {
    setPostsLoading(true);
    setPostsError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserPosts(response.data);
    } catch (err) {
      console.error("Error fetching user posts:", err);
      setPostsError('Failed to fetch user posts.');
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  // Fetch posts after userData is loaded
  useEffect(() => {
    if (userData && userData.userId) {
      fetchUserPosts(userData.userId);
    }
  }, [userData]);

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150/007bff/FFFFFF?Text=User';
  };

  const handleOpenEditModal = () => {
    setEditableUserData({ ...userData }); // Reset form with current user data
    setIsEditModalOpen(true);
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/me/profile`, editableUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data); // Update main user data
      setEditableUserData(response.data); // also update editable data to reflect saved changes

      // ---- ADD/ADAPT THIS SECTION TO UPDATE LOCALSTORAGE for other fields ----
      const existingUserLocalStorage = localStorage.getItem('user');
      if (existingUserLocalStorage) {
        try {
          const userObj = JSON.parse(existingUserLocalStorage);
          userObj.name = response.data.name; // Update name
          userObj.profileImage = response.data.profileImage; // Also update image if it's part of this response
          userObj.city = response.data.city;
          userObj.country = response.data.country;
          // ... update other relevant fields ...
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (e) {
            console.error("Failed to update user in localStorage after profile save:", e);
             localStorage.setItem('user', JSON.stringify(response.data)); // Fallback to overwrite
        }
      } else {
         localStorage.setItem('user', JSON.stringify(response.data)); // Fallback if no 'user'
      }
      // --------------------------------------------------------------------

      handleCloseEditModal();
      Swal.fire('Success!', 'Profile updated successfully.', 'success');
    } catch (err) {
      console.error("Error updating user data:", err);
      const message = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setUpdateError(message);
      Swal.fire('Error!', message, 'error');
    }
  };
  
  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/me/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data); // Update state in Profile.jsx
      setEditableUserData(response.data);

      // ---- ADD THIS SECTION TO UPDATE LOCALSTORAGE ----
      const existingUserLocalStorage = localStorage.getItem('user');
      if (existingUserLocalStorage) {
        try {
          const userObj = JSON.parse(existingUserLocalStorage);
          userObj.profileImage = response.data.profileImage; 
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (e) {
          console.error("Failed to update user in localStorage after profile image change:", e);
          // Fallback: Store the whole new user data from response if parsing old one fails
          // or if you want to ensure all fields are fresh
          localStorage.setItem('user', JSON.stringify({
            name: response.data.name,
            userId: response.data.userId,
            email: response.data.email,
            country: response.data.country,
            city: response.data.city,
            profileImage: response.data.profileImage
          }));
        }
      } else {
        // If for some reason 'user' wasn't in localStorage, store the new data.
        localStorage.setItem('user', JSON.stringify({
            name: response.data.name,
            userId: response.data.userId,
            email: response.data.email,
            country: response.data.country,
            city: response.data.city,
            profileImage: response.data.profileImage
          }));
      }
      // -------------------------------------------------

      Swal.fire('Uploaded!', 'Profile image updated successfully.', 'success');
    } catch (err) {
      console.error("Error uploading profile image:", err);
      const message = err.response?.data?.message || 'Failed to upload profile image.';
      Swal.fire('Error!', message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Post Menu Handlers
  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setOpenMenuPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMenuPostId(null);
  };

  // Edit Post Handlers
  const handleEditPost = () => {
    const post = userPosts.find(p => p.postId === openMenuPostId);
    if (post) {
      setPostToEdit(post);
      setIsPostUpdateModalOpen(true);
    }
    handleMenuClose();
  };

  const handlePostUpdated = () => {
    setIsPostUpdateModalOpen(false);
    setPostToEdit(null);
    Swal.fire('Updated!', 'Post updated successfully.', 'success');
    if (userData && userData.userId) {
      fetchUserPosts(userData.userId); // Refresh posts list
    }
  };

  // Delete Post Handlers
  const handleDeletePostRequest = () => {
    setPostIdToDelete(openMenuPostId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDeletePost = async () => {
    const token = localStorage.getItem('token');
    if (!token || !postIdToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${postIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire('Deleted!', 'Post deleted successfully.', 'success');
      setUserPosts(prevPosts => prevPosts.filter(post => post.postId !== postIdToDelete));
    } catch (err) {
      console.error("Error deleting post:", err);
      Swal.fire('Error!', 'Failed to delete post.', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setPostIdToDelete(null);
    }
  };

  if (loading && !userData) { // Show loading only if userData is not yet available
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div className="text-center py-10">No user data found.</div>;
  }
  
  const getFullNameParts = (name) => {
    if (!name) return { firstName: '', lastName: '' };
    const parts = name.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
  };

  const { firstName, lastName } = getFullNameParts(userData.name);

  // More robust way to handle profile image paths
  const getImageUrl = (profileImage) => {
    if (!profileImage) return 'https://via.placeholder.com/150?text=User';
    
    // Remove all instances of /api/media/files/ to avoid duplication
    const cleanPath = profileImage.replace(/\/api\/media\/files\//g, '');
    
    // Remove any leading slashes
    const finalPath = cleanPath.replace(/^\/+/, '');
    
    return `${API_BASE_URL}/api/media/files/${finalPath}`;
  };

  const imageUrl = getImageUrl(userData.profileImage);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #f0f8fa 0%, #e8f0f8 20%, #f5eef1 40%, #edf5ef 60%, #f2f7f0 80%, #f0f8fa 100%)' }}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Left Sidebar */}
          <aside className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-lg shadow-lg p-6 flex flex-col items-center relative md:sticky md:top-8">
            <div className="absolute top-0 left-0 w-full h-32 md:h-40 rounded-t-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1124&q=100"
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative mt-16 md:mt-24 w-32 h-32 md:w-36 md:h-36">
              <img
                src={imageUrl}
                alt={userData.name || 'User'}
                onError={handleImageError}
                className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-md object-cover"
              />
              {/* Spinner overlay */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              {/* Camera icon overlay */}
              <label
                htmlFor="profileUpload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 rounded-full cursor-pointer transition-opacity duration-300"
                style={{ zIndex: 2 }}
              >
                <Camera size={28} className="text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </label>
              <input
                type="file"
                id="profileUpload"
                className="hidden"
                accept="image/*"
                onChange={handleProfileImageUpload}
                disabled={isUploading}
              />
            </div>
            <h1 className="text-2xl font-bold mt-4 text-gray-800">{userData.name || 'User Name'}</h1>
            <p className="text-sm text-gray-500 mt-1 text-center">@{userData.username || 'username'}</p>
            <p className="text-md text-gray-600 mt-1">{userData.occupation || 'Occupation not set'}</p>
            <div className="flex items-center text-gray-500 mt-2">
              <MapPin size={16} className="mr-1" />
              <span>{userData.city || 'City not set'}, {userData.country || 'Country not set'}</span>
            </div>
            
            <div className="flex justify-around w-full mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="font-bold text-xl text-gray-700">1.2K</p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-gray-700">348</p>
                <p className="text-sm text-gray-500">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-gray-700">4.1M</p>
                <p className="text-sm text-gray-500">Likes</p>
              </div>
            </div>

           {/*<div className="flex gap-3 w-full mt-6">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 text-sm font-semibold">
                Follow
              </button>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-150 text-sm font-semibold">
                Message
              </button>
            </div> */}
          </aside>

          {/* Right Content Area */}
          <main className="w-full md:w-2/3 lg:w-3/4 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={getImageUrl(userData.profileImage)}
                    alt={userData.name || 'User'}
                    onError={handleImageError}
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Spinner overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                    </div>
                  )}
                  {/* Camera icon overlay */}
                  <label 
                    htmlFor="profileUpload" 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full cursor-pointer transition-opacity duration-300"
                  >
                    <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </label>
                  <input type="file" id="profileUpload" className="hidden" accept="image/*" onChange={handleProfileImageUpload} disabled={isUploading}/>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{userData.name || 'User Name'}</h2>
                  <p className="text-gray-600">{userData.occupation || 'Admin'}</p>
                  <p className="text-sm text-gray-500">{userData.city || 'City'}, {userData.country || 'Country'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[0_2px_16px_rgba(98,167,173,0.10)] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Personal Information</h3>
                <button 
                  onClick={handleOpenEditModal}
                  className="border border-[#62a7ad] text-[#62a7ad] px-[10px] py-[5px] rounded-md text-sm font-medium hover:text-[#78a0a4] hover:border-[#78a0a4] transition flex items-center">
                  <Edit3 size={14} className="mr-1.5" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <label className="block text-gray-500 font-medium">First Name</label>
                  <p className="text-gray-800 mt-0.5">{firstName}</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Last Name</label>
                  <p className="text-gray-800 mt-0.5">{lastName}</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Date of Birth</label>
                  <p className="text-gray-800 mt-0.5">{userData.birthday ? new Date(userData.birthday).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Email Address</label>
                  <p className="text-gray-800 mt-0.5">{userData.email}</p>
                </div>
                 <div>
                  <label className="block text-gray-500 font-medium">Occupation</label>
                  <p className="text-gray-800 mt-0.5">{userData.occupation || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[0_2px_16px_rgba(98,167,173,0.10)] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Address</h3>
                <button 
                  onClick={handleOpenEditModal} /* Consider separate edit for address or one big edit */
                  className="text-blue-600 hover:text-blue-800 px-[10px] py-[5px] rounded-md text-sm font-medium border border-blue-600 hover:border-blue-800 transition flex items-center">
                  <Edit3 size={14} className="mr-1.5" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div>
                  <label className="block text-gray-500 font-medium">Country</label>
                  <p className="text-gray-800 mt-0.5">{userData.country || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">City</label>
                  <p className="text-gray-800 mt-0.5">{userData.city || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium">Postal Code</label>
                  <p className="text-gray-800 mt-0.5">{userData.postalCode || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[0_2px_16px_rgba(98,167,173,0.10)] p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">My Posts</h3>
              <PostsView 
                posts={userPosts} 
                loading={postsLoading} 
                error={postsError} 
                showAuthorInfo={false} 
                currentUserId={userData?.userId}
                onOpenMenu={handleMenuOpen}
                mediaMaxHeight="max-h-80"
              />
            </div>
          </main>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Edit Profile</h2>
              <button onClick={handleCloseEditModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" name="name" id="name" value={editableUserData.name || ''} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input type="text" name="occupation" id="occupation" value={editableUserData.occupation || ''} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                <input type="date" name="birthday" id="birthday" value={editableUserData.birthday || ''} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" name="country" id="country" value={editableUserData.country || ''} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city" id="city" value={editableUserData.city || ''} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input type="text" name="postalCode" id="postalCode" value={editableUserData.postalCode || ''} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>

              {updateError && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{updateError}</p>}
              
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={handleCloseEditModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MUI Menu for Post Options */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl && openMenuPostId)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            borderRadius: '8px',
            '& .MuiSvgIcon-root': { // If using MUI icons in menu items
              width: 20,
              height: 20,
              mr: 1.5,
            },
            '& .lucide': { // If using Lucide icons in menu items
              width: 18,
              height: 18,
              marginRight: '12px',
              color: 'currentColor' 
            }
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditPost} sx={{ paddingY: '10px', paddingX: '16px'}}>
          <EditIconLucide /> Edit Post
        </MenuItem>
        <MenuItem onClick={handleDeletePostRequest} sx={{ color: 'error.main', paddingY: '10px', paddingX: '16px'}}>
          <DeleteIconLucide /> Delete Post
        </MenuItem>
      </Menu>

      {/* Post Update Modal */}
      {postToEdit && (
        <PostUpdate
          open={isPostUpdateModalOpen}
          onClose={() => {
            setIsPostUpdateModalOpen(false);
            setPostToEdit(null);
          }}
          postData={postToEdit}
          onPostUpdated={handlePostUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { borderRadius: '12px', padding: '10px' } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to permanently delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ paddingRight: '20px', paddingBottom: '16px' }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDeletePost} color="error" variant="contained" autoFocus sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Profile;
