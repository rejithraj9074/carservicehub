import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import apiClient from '../../api/client';

const SimpleRescheduleModal = ({ open, onClose, booking, onRescheduled }) => {
  const [formData, setFormData] = useState({
    newDate: '',
    newTime: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set minimum date to today to prevent past date selection
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (open && booking) {
      // Reset form when modal opens
      setFormData({
        newDate: '',
        newTime: '',
        reason: ''
      });
      setError('');
    }
  }, [open, booking]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.newDate || !formData.newTime) {
        throw new Error('Please select both date and time');
      }

      // Check if the new date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.newDate);
      
      if (selectedDate < today) {
        throw new Error('Cannot select a past date');
      }

      const payload = {
        newDate: formData.newDate,
        newTime: formData.newTime,
        reason: formData.reason || 'Customer requested reschedule'
      };

      await apiClient.putJson(`/api/bookings/${booking._id}/reschedule`, payload);
      
      onRescheduled();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule booking');
    } finally {
      setLoading(false);
    }
  };

  // Always render the dialog but control visibility with the open prop
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        style: {
          zIndex: 1300 // Ensure it's on top
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div" fontWeight={700}>
          Reschedule Booking
        </Typography>
        {booking && (
          <Typography variant="body2" color="text.secondary">
            Booking ID: {booking._id?.substring(0, 8) || ''}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {booking && (
          <Box sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
                  Current Booking Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.serviceType || 'Service'} - {booking.vehicleInfo?.make} {booking.vehicleInfo?.model}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : ''} at {booking.scheduledTime}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
                  New Date & Time
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    type="date"
                    label="New Date"
                    value={formData.newDate}
                    onChange={handleChange('newDate')}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: today }}
                    required
                  />
                  <TextField
                    type="time"
                    label="New Time"
                    value={formData.newTime}
                    onChange={handleChange('newTime')}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Stack>
              </Box>
              
              <TextField
                label="Reason for Rescheduling (Optional)"
                value={formData.reason}
                onChange={handleChange('reason')}
                fullWidth
                multiline
                minRows={2}
                placeholder="Briefly explain why you need to reschedule..."
              />
            </Stack>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !booking}
          sx={{ 
            backgroundColor: '#1E40AF',
            '&:hover': { backgroundColor: '#2563EB' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Reschedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleRescheduleModal;