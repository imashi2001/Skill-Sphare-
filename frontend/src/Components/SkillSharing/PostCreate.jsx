import React, { useState } from 'react';
import { Modal, TextField, Button, MenuItem, CircularProgress, Snackbar, Alert, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const categories = [
  'Technology',
  'Science',
  'Art',
  'Music',
  'Sports',
  'Education',
  'Other',
];

function PostCreate({ onClose }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const currentImageCount = files.filter(f => f.type.startsWith('image/')).length;
    const currentVideoCount = files.filter(f => f.type.startsWith('video/')).length;

    let newImages = [];
    let newVideos = [];

    for (const file of selectedFiles) {
      if (file.type.startsWith('image/')) {
        if (newImages.length + currentImageCount < 3) {
          newImages.push(file);
        } else {
          setError('You can upload up to 3 images only.');
          break; 
        }
      } else if (file.type.startsWith('video/')) {
        if (newVideos.length + currentVideoCount < 1) {
          newVideos.push(file);
        } else {
          setError('You can upload only 1 video.');
          break; 
        }
      }
    }
    
    const updatedFiles = [...files, ...newImages, ...newVideos];
    setFiles(updatedFiles);
    
    const readers = updatedFiles.map(f => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ file: f, url: reader.result });
        reader.readAsDataURL(f);
      });
    });
    Promise.all(readers).then(urls => setPreviewUrls(urls));
  };

  const removePreview = (fileToRemove) => {
    setFiles(prevFiles => prevFiles.filter(f => f !== fileToRemove));
    setPreviewUrls(prevPreviews => prevPreviews.filter(p => p.file !== fileToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      // 1. Create the post
      const postRes = await axios.post(
        'http://localhost:8080/api/posts',
        { title, content, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const postId = postRes.data.postId;
      // 2. If media, upload each file (up to 3 images and 1 video)
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('postId', postId);
        formData.append('mediaType', file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO');
        await axios.post('http://localhost:8080/api/media/upload', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setSuccess('Post created successfully!');
      // Wait for 1 second to show success message before navigating
      setTimeout(() => {
        onClose();
        // Navigate to posts page
        window.location.href = '/posts';
      }, 1000);
    } catch (err) {
      setError('Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-5 p-1">
      <h2 className="text-2xl font-semibold text-gray-700 mb-1 text-center">Create New Post</h2>
      <TextField
        label="Title"
        variant="outlined"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        disabled={loading}
        fullWidth
        size="small"
      />
      <TextField
        label="Content"
        variant="outlined"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        multiline
        minRows={4}
        disabled={loading}
        fullWidth
        size="small"
      />
      <TextField
        select
        label="Category"
        variant="outlined"
        value={category}
        onChange={e => setCategory(e.target.value)}
        required
        disabled={loading}
        fullWidth
        size="small"
      >
        {categories.map(cat => (
          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
        ))}
      </TextField>
      
      <Button
        variant="contained"
        component="label"
        disabled={loading}
        fullWidth
        startIcon={<CloudUploadIcon />}
        sx={{ bgcolor: '#edf2f7', color: '#4a5568', '&:hover': { bgcolor: '#e2e8f0' } }}
      >
        Upload Media (Max: 3 Images, 1 Video)
        <input
          type="file"
          hidden
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
        />
      </Button>

      {previewUrls.length > 0 && (
        <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Media Previews:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previewUrls.map((preview, idx) => (
              <div key={idx} className="relative group border rounded-md overflow-hidden shadow-sm aspect-square">
                {preview.file.type.startsWith('image/') ? (
                  <img src={preview.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                ) : (
                  <video src={preview.url} controls className="w-full h-full object-cover bg-black" />
                )}
                <IconButton 
                  size="small"
                  onClick={() => removePreview(preview.file)}
                  className="absolute top-1 right-1 bg-black bg-opacity-40 text-white hover:bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={loading}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
        <Button variant="outlined" onClick={onClose} disabled={loading} sx={{textTransform: 'none'}}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit" disabled={loading} sx={{textTransform: 'none', px:3}}>
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Post'}
        </Button>
      </div>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={2000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </form>
  );
}

export default PostCreate;
