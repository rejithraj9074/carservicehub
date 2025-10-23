import React from 'react';
import { Card, CardContent, Typography, Chip, Stack, Button, Box, Grid, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const statusColor = {
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'error',
  rescheduled: 'default',
};

const ActiveBookings = ({ bookings = [], onTrack, onCancel, onReschedule }) => {
  return (
    <Grid container spacing={3}>
      {bookings.map((bk, idx) => {
        const dateLabel = bk.scheduledDate ? new Date(bk.scheduledDate).toLocaleDateString() : bk.date;
        const timeLabel = bk.scheduledTime || bk.time;
        const vehicle = bk.vehicleInfo ? `${bk.vehicleInfo.make || ''} ${bk.vehicleInfo.model || ''}`.trim() : undefined;
        const location = bk.location?.address?.street || undefined;
        const title = bk.serviceType || bk.title || 'Service Booking';
        const status = bk.status || 'pending';
        return (
        <Grid key={idx} item xs={12} md={6}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            elevation={2}
            sx={{ 
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <CardContent sx={{ flex: 1, p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A', mb: 0.5 }}>{vehicle || 'Vehicle Service'}</Typography>
                  <Typography variant="body2" color="text.secondary">{dateLabel}{timeLabel ? ` • ${timeLabel}` : ''}</Typography>
                  {location && (
                    <Typography variant="body2" color="text.secondary">{location}</Typography>
                  )}
                </Box>
                <Chip label={status.replace('_',' ')} color={statusColor[status] || 'default'} variant="filled" />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button 
                  size="medium" 
                  variant="outlined" 
                  onClick={() => onTrack?.(bk)}
                  sx={{ 
                    borderColor: '#1E3A8A', 
                    color: '#1E3A8A',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    flex: 1,
                    '&:hover': {
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(28, 58, 138, 0.04)'
                    }
                  }}
                >
                  Track
                </Button>
                <Button 
                  size="medium" 
                  variant="outlined" 
                  color="warning" 
                  onClick={() => {
                    console.log('Reschedule button clicked for booking:', bk);
                    onReschedule?.(bk);
                  }}
                  sx={{ 
                    borderColor: '#F59E0B', 
                    color: '#F59E0B',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    flex: 1,
                    '&:hover': {
                      borderColor: '#F59E0B',
                      backgroundColor: 'rgba(245, 158, 11, 0.04)'
                    }
                  }}
                >
                  Reschedule
                </Button>
                <Button 
                  size="medium" 
                  variant="contained" 
                  color="error" 
                  onClick={() => onCancel?.(bk)}
                  sx={{ 
                    backgroundColor: '#EF4444',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    flex: 1,
                    '&:hover': {
                      backgroundColor: '#DC2626',
                    }
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
        );
      })}
      {bookings.length === 0 && (
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                No active bookings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You don't have any active bookings at the moment.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default ActiveBookings;