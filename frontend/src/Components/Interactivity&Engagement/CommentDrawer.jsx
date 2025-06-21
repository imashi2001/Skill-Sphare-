import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X as XIcon, Send as SendIcon, MessageCircle as MessageCircleIcon, Edit2 as EditIconLucide, Trash2 as DeleteIconLucide } from 'lucide-react';
import { Avatar, TextField, Button, CircularProgress, Typography, Paper, IconButton, Menu, MenuItem, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; 
import avatarPlaceholder from '../../assets/avatar.png'; // Default avatar

// Helper to format date (simplified)
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CommentDrawer = ({ postId, currentUser, onClose, postOwnerId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [error, setError] = useState(null);
  const commentsEndRef = useRef(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  const [anchorElCommentMenu, setAnchorElCommentMenu] = useState(null);
  const [currentMenuCommentId, setCurrentMenuCommentId] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const loggedInUserId = JSON.parse(localStorage.getItem('user'))?.userId;

  const [justPosted, setJustPosted] = useState(false);

  const fetchComments = async () => {
    if (!postId) return;
    setIsLoadingComments(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:8080/api/comments/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data?._embedded?.commentDTOList || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Could not load comments.');
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (justPosted && commentsEndRef.current && !editingCommentId) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setJustPosted(false);
    }
  }, [comments, editingCommentId, justPosted]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !loggedInUserId) {
      setError('Comment cannot be empty and user must be logged in.');
      return;
    }
    setIsPostingComment(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const payload = {
        content: newComment,
        postId: postId,
      };
      await axios.post('http://localhost:8080/api/comments', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewComment('');
      setJustPosted(true);
      fetchComments();
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not post comment.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleOpenCommentMenu = (event, commentId) => {
    setAnchorElCommentMenu(event.currentTarget);
    setCurrentMenuCommentId(commentId);
  };

  const handleCloseCommentMenu = () => {
    setAnchorElCommentMenu(null);
    setCurrentMenuCommentId(null);
  };
  
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.commentId);
    setEditingCommentContent(comment.content);
    handleCloseCommentMenu();
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleSaveUpdate = async () => {
    if (!editingCommentContent.trim()) {
      setError('Comment content cannot be empty.');
      return;
    }
    setIsUpdatingComment(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:8080/api/comments/${editingCommentId}?updatedContent=${encodeURIComponent(editingCommentContent)}`, 
        {}, // Empty body
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCancelEdit();
      fetchComments();
    } catch (err) {
      console.error('Failed to update comment:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not update comment.');
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const requestDeleteComment = (commentId) => {
    setCommentIdToDelete(commentId);
    setDeleteConfirmOpen(true);
    handleCloseCommentMenu();
  };

  const handleConfirmDelete = async () => {
    if (!commentIdToDelete) return;
    setIsDeletingComment(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`http://localhost:8080/api/comments/${commentIdToDelete}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchComments();
        setDeleteConfirmOpen(false);
        setCommentIdToDelete(null);
    } catch (err) {
        console.error('Failed to delete comment:', err);
        setError(err.response?.data?.message || err.response?.data?.error || 'Could not delete comment.');
    } finally {
        setIsDeletingComment(false);
    }
  };

  const drawerVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: '0%', opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.3 } },
  };

  // Placeholder for commenter details if not provided by backend DTO
  const getCommenterDetails = (comment) => {
    return {
      name: comment.commenterUsername || `User ${comment.userId}`,
      avatarUrl: comment.commenterAvatarUrl || avatarPlaceholder,
    };
  };

  return (
    <AnimatePresence>
      {postId && (
        <motion.div
          key="commentDrawer"
          variants={drawerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white border-t border-gray-300 flex flex-col rounded-b-xl"
          style={{ maxHeight: 'none', position: 'static', boxShadow: 'none' }}
        >
          <Paper elevation={0} className="p-4 flex items-center justify-between bg-white border-b rounded-t-xl">
            <Typography variant="h6" className="font-semibold">Comments</Typography>
            <IconButton onClick={onClose} size="small">
              <XIcon />
            </IconButton>
          </Paper>

          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoadingComments && (
              <div className="flex justify-center items-center h-full">
                <CircularProgress />
              </div>
            )}
            {!isLoadingComments && error && (
              <Typography color="error" className="text-center">{error}</Typography>
            )}
            {!isLoadingComments && !error && comments.length === 0 && (
              <div className="text-center py-10">
                  <MessageCircleIcon size={48} className="mx-auto text-gray-400 mb-2" />
                <Typography className="text-gray-500">No comments yet.</Typography>
                <Typography variant="body2" className="text-gray-400">Be the first to share your thoughts!</Typography>
              </div>
            )}
            {!isLoadingComments && !error && comments.map((comment) => {
              const commenter = getCommenterDetails(comment);
              const isCommentOwner = comment.userId === loggedInUserId;
              const isCurrentUserPostOwner = loggedInUserId && postOwnerId && loggedInUserId === postOwnerId;
              const canEditComment = isCommentOwner;
              const canDeleteCommentByPermission = isCommentOwner || isCurrentUserPostOwner;

              return (
                <Paper key={comment.commentId} elevation={1} className="p-3 rounded-lg group">
                  <div className="flex items-start space-x-3">
                    <Avatar src={commenter.avatarUrl} alt={commenter.name} sx={{ width: 36, height: 36 }} />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline space-x-2">
                          <Typography variant="subtitle2" className="font-semibold text-gray-800">
                            {commenter.name}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {formatDate(comment.createdAt)}
                            {comment.updatedAt && comment.createdAt !== comment.updatedAt && (
                                <Tooltip title={`Edited: ${formatDate(comment.updatedAt)}`} placement="top">
                                    <span className="text-gray-400 text-xs ml-1">(edited)</span>
                                </Tooltip>
                            )}
                          </Typography>
                        </div>
                        {(canEditComment || canDeleteCommentByPermission) && editingCommentId !== comment.commentId && (
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleOpenCommentMenu(e, comment.commentId)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </div>

                      {editingCommentId === comment.commentId ? (
                        <div className="mt-2 space-y-2">
                          <TextField
                            fullWidth
                            multiline
                            variant="outlined"
                            size="small"
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            autoFocus
                            disabled={isUpdatingComment}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="small" 
                              onClick={handleCancelEdit} 
                              disabled={isUpdatingComment}
                              sx={{textTransform: 'none'}}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={handleSaveUpdate} 
                              disabled={isUpdatingComment || !editingCommentContent.trim()}
                              sx={{textTransform: 'none'}}
                            >
                              {isUpdatingComment ? <CircularProgress size={18} color="inherit"/> : 'Save'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Typography variant="body2" className="text-gray-700 whitespace-pre-wrap break-words mt-0.5">
                          {comment.content}
                        </Typography>
                      )}
                    </div>
                  </div>
                </Paper>
              );
            })}
            <Menu
                anchorEl={anchorElCommentMenu}
                open={Boolean(anchorElCommentMenu)}
                onClose={handleCloseCommentMenu}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible', filter: 'drop-shadow(0px 1px 4px rgba(0,0,0,0.1))', mt: 0.5, borderRadius: '6px',
                        '& .MuiMenuItem-root': { fontSize: '0.875rem', py: 0.8 },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {comments.find(c => c.commentId === currentMenuCommentId)?.userId === loggedInUserId && (
                    <MenuItem onClick={() => handleStartEdit(comments.find(c => c.commentId === currentMenuCommentId))}>
                        <EditIconLucide size={16} className="mr-2 text-gray-600" /> Edit
                    </MenuItem>
                )}
                {(comments.find(c => c.commentId === currentMenuCommentId)?.userId === loggedInUserId || (loggedInUserId && postOwnerId && loggedInUserId === postOwnerId) ) && (
                    <MenuItem onClick={() => requestDeleteComment(currentMenuCommentId)} sx={{color: 'error.main'}}>
                        <DeleteIconLucide size={16} className="mr-2" /> Delete
                    </MenuItem>
                )}
            </Menu>
            <div ref={commentsEndRef} />
          </div>

          <Paper elevation={2} className="p-3 border-t bg-white rounded-b-xl">
            <div className="flex items-center space-x-3">
              <Avatar src={currentUser?.avatar || avatarPlaceholder} alt={currentUser?.name || "You"} sx={{ width: 40, height: 40 }} />
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                multiline
                maxRows={3}
                size="small"
                disabled={isPostingComment}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handlePostComment}
                disabled={isPostingComment || !newComment.trim()}
                size="medium"
                sx={{ borderRadius: '20px', textTransform: 'none', px:3 }}
              >
                {isPostingComment ? <CircularProgress size={20} color="inherit" /> : <SendIcon size={18} />}
              </Button>
            </div>
            {error && !isLoadingComments && <Typography color="error" variant="caption" sx={{display: 'block', mt:1}}>{error}</Typography>}
          </Paper>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteConfirmOpen}
            onClose={() => {if(!isDeletingComment) setDeleteConfirmOpen(false);}}
            aria-labelledby="delete-comment-dialog-title"
            PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}
          >
            <DialogTitle id="delete-comment-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'medium' }}>
              <WarningAmberIcon sx={{ color: 'warning.main', fontSize: '1.8rem' }}/>
              Confirm Deletion
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to permanently delete this comment? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{pb: 1.5, px:2}}>
              <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeletingComment} color="inherit" sx={{textTransform: 'none'}}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeletingComment} autoFocus sx={{textTransform: 'none'}}>
                {isDeletingComment ? <CircularProgress size={20} color="inherit"/> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentDrawer;