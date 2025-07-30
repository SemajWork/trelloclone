import React, { useState, useEffect } from 'react';
import { Avatar, IconButton, TextField, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import './componentscss/CommentsSection.css';

export const CommentsSection = ({ taskId, comments = [], onAddComment, onDeleteComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(taskId, newComment.trim());
      setNewComment('');
      setIsAddingComment(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h4>Comments ({comments.length})</h4>
      </div>
      
      <div className="comments-list">
        {comments.map((comment, index) => (
          <div key={index} className="comment-item">
            <div className="comment-avatar">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--trello-blue)' }}>
                {comment.author?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </div>
            <div className="comment-content">
              <div className="comment-header">
                <span className="comment-author">{comment.author || 'Anonymous'}</span>
                <span className="comment-date">{formatDate(comment.timestamp)}</span>
              </div>
              <div className="comment-text">{comment.text}</div>
            </div>
            <div className="comment-actions">
              <IconButton 
                size="small" 
                onClick={() => onDeleteComment(taskId, index)}
                sx={{ color: 'var(--text-tertiary)' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <div className="add-comment-section">
        {!isAddingComment ? (
          <Button
            variant="text"
            onClick={() => setIsAddingComment(true)}
            sx={{
              color: 'var(--text-secondary)',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'var(--hover-bg)'
              }
            }}
          >
            Add a comment...
          </Button>
        ) : (
          <div className="comment-input-container">
            <TextField
              multiline
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write a comment..."
              variant="outlined"
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--bg-primary)',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--border-secondary)'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--border-focus)'
                    }
                  }
                }
              }}
            />
            <div className="comment-actions">
              <Button
                variant="text"
                onClick={() => {
                  setIsAddingComment(false);
                  setNewComment('');
                }}
                sx={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                startIcon={<SendIcon />}
                sx={{
                  backgroundColor: 'var(--trello-blue)',
                  '&:hover': {
                    backgroundColor: 'var(--trello-blue-dark)'
                  },
                  '&:disabled': {
                    backgroundColor: 'var(--border-secondary)'
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 