import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, TextField, Button, Select, MenuItem, InputLabel, FormControl, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Assuming categories are defined globally or passed as props if dynamic
const categories = ['Technology', 'Science', 'Art', 'Music', 'Sports', 'Education', 'Other'];

function PostUpdate({ open, onClose, postData, onPostUpdated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [existingMedia, setExistingMedia] = useState([]);
  const [newlySelectedFiles, setNewlySelectedFiles] = useState([]); // Files selected in input
  const [newMediaPreviews, setNewMediaPreviews] = useState([]); // Data URLs for new files
  const [mediaToDelete, setMediaToDelete] = useState([]); // IDs of existing media to delete

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (postData) {
      setTitle(postData.title || '');
      setContent(postData.content || '');
      setCategory(postData.category || '');
      setExistingMedia(postData.mediaList || []);
      setNewlySelectedFiles([]); // Reset file input state
      setNewMediaPreviews([]);
      setMediaToDelete([]);
      setError(null);
      setSuccess(null);
    }
  }, [postData, open]); // Rerun when postData or open status changes

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewlySelectedFiles(prevFiles => [...prevFiles, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMediaPreviews(prevPreviews => [...prevPreviews, { url: reader.result, type: file.type, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingMedia = (mediaId) => {
    setExistingMedia(prev => prev.filter(m => m.mediaId !== mediaId));
    setMediaToDelete(prev => [...prev, mediaId]);
  };

  const removeNewMediaPreview = (index) => {
    setNewlySelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setNewMediaPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('token');

    if (!token || !postData) {
      setError('Authentication error or no post selected.');
      setLoading(false);
      return;
    }

    try {
      // 1. Update Text Content
      await axios.put(
        `http://localhost:8080/api/posts/${postData.postId}`,
        { title, content, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Delete Media Marked for Deletion
      if (mediaToDelete.length > 0) {
        await Promise.all(
          mediaToDelete.map(mediaId =>
            axios.delete(`http://localhost:8080/api/media/${mediaId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
      }

      // 3. Upload New Media
      if (newlySelectedFiles.length > 0) {
        const uploadPromises = newlySelectedFiles.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('postId', postData.postId);
          formData.append('mediaType', file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO');
          return axios.post('http://localhost:8080/api/media/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });
        });
        await Promise.all(uploadPromises);
      }

      setSuccess('Post updated successfully!');
      setLoading(false);
      onPostUpdated(); // This should refresh the posts list in parent
      // onClose(); // Close modal after a short delay or let parent handle
      setTimeout(() => {
        onClose();
      }, 1500)


    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update post. Please try again.'
      );
      setLoading(false);
    }
  };

  if (!postData) return null; // Don't render if no post data

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="update-post-modal-title">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '70%', md: '50%' },
          maxWidth: '600px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Typography id="update-post-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          Edit Post
        </Typography>
        <form onSubmit={handleUpdateSubmit}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <FormControl fullWidth margin="normal" required disabled={loading}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Existing Media Display */}
          {existingMedia.length > 0 && <Typography variant="subtitle1" sx={{ mt: 2, mb:1 }}>Existing Media:</Typography>}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: 2 }}>
            {existingMedia.map((media) => (
              <Box key={media.mediaId} sx={{ position: 'relative', width: 100, height: 100, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                {media.mediaType === 'IMAGE' ? (
                  <img src={media.mediaUrl} alt="existing media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <video src={media.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                )}
                <IconButton
                  size="small"
                  onClick={() => removeExistingMedia(media.mediaId)}
                  disabled={loading}
                  sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)'} }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          {/* New Media Previews */}
          {newMediaPreviews.length > 0 && <Typography variant="subtitle1" sx={{ mt: 2, mb:1 }}>New Media to Upload:</Typography>}
           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: 2 }}>
            {newMediaPreviews.map((preview, index) => (
              <Box key={index} sx={{ position: 'relative', width: 100, height: 100, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                {preview.type.startsWith('image/') ? (
                  <img src={preview.url} alt={`new media ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <video src={preview.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                )}
                <IconButton
                  size="small"
                  onClick={() => removeNewMediaPreview(index)}
                  disabled={loading}
                  sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)'} }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 1, mb: 2 }}
            disabled={loading}
          >
            Upload New Media
            <input type="file" hidden multiple onChange={handleFileChange} accept="image/*,video/*" />
          </Button>

          {error && <Typography color="error" sx={{ mt: 1, mb:1 }}>{error}</Typography>}
          {success && <Typography color="primary" sx={{ mt: 1, mb:1 }}>{success}</Typography>}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Update Post'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}

export default PostUpdate;
