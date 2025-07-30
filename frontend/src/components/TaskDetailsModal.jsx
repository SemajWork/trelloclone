import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { CommentsSection } from './CommentsSection';
import './componentscss/TaskDetailsModal.css';

export const TaskDetailsModal = ({ 
  open, 
  onClose, 
  task, 
  column,
  onUpdateTask, 
  onDeleteTask, 
  onAddComment, 
  onDeleteComment 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [description, setDescription] = useState(task?.description || '');

  useEffect(() => {
    if (task) {
      setEditedContent(task.content);
      setDescription(task.description || '');
    }
  }, [task]);

  const handleSave = () => {
    if (editedContent.trim()) {
      onUpdateTask(task.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(task.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(column.id, task.id);
      onClose();
    }
  };

  const handleDescriptionChange = (newDescription) => {
    setDescription(newDescription);
    // You can add a function to save description to localStorage here
  };

  if (!task) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-heavy)',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-primary)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px 24px 16px 24px',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            Task Details
          </Typography>
          <Chip 
            label={column?.title || 'Unknown Column'} 
            size="small" 
            sx={{ 
              backgroundColor: 'var(--trello-blue)', 
              color: 'white',
              fontSize: '12px'
            }} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={() => setIsEditing(!isEditing)}
            sx={{ color: 'var(--text-secondary)' }}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            onClick={handleDelete}
            sx={{ color: 'var(--error)' }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton 
            onClick={onClose}
            sx={{ color: 'var(--text-secondary)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: '24px', minHeight: '400px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Task Content Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ 
              color: 'var(--text-secondary)', 
              marginBottom: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '0.5px'
            }}>
              Task Content
            </Typography>
            
            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  multiline
                  rows={3}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  variant="outlined"
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                    disabled={!editedContent.trim()}
                    sx={{
                      backgroundColor: 'var(--success)',
                      '&:hover': {
                        backgroundColor: '#4caf50'
                      },
                      '&:disabled': {
                        backgroundColor: 'var(--border-secondary)'
                      }
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                    sx={{
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-secondary)',
                      '&:hover': {
                        borderColor: 'var(--border-secondary)',
                        backgroundColor: 'var(--hover-bg)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography sx={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.5 }}>
                  {task.content}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ borderColor: 'var(--border-primary)' }} />

          {/* Description Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ 
              color: 'var(--text-secondary)', 
              marginBottom: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '0.5px'
            }}>
              Description
            </Typography>
            <TextField
              multiline
              rows={4}
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Add a more detailed description..."
              variant="outlined"
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
          </Box>

          <Divider sx={{ borderColor: 'var(--border-primary)' }} />

          {/* Comments Section */}
          <Box>
            <CommentsSection
              taskId={task.id}
              comments={task.comments || []}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        padding: '16px 24px 24px 24px',
        borderTop: '1px solid var(--border-primary)',
        justifyContent: 'space-between'
      }}>
        <Typography variant="caption" sx={{ color: 'var(--text-tertiary)' }}>
          Created in {column?.title || 'Unknown Column'}
        </Typography>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: 'var(--trello-blue)',
            '&:hover': {
              backgroundColor: 'var(--trello-blue-dark)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 