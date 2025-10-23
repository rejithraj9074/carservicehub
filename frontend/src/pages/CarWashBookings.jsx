import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import ActiveBookings from '../components/dashboard/ActiveBookings';
import apiClient from '../api/client';

const CarWashBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch car wash bookings specifically
        const res = await apiClient.getJson('/api/carwash?limit=50');
        setBookings(res.bookings || []);
      } catch (e) {
        setError(e?.message || 'Failed to load car wash bookings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Your Car Wash Bookings</Typography>
        <Typography variant="body2" color="text.secondary">View and manage your active and recent car wash bookings</Typography>
      </Box>
      <ActiveBookings bookings={bookings} />
    </Container>
  );
};

export default CarWashBookings;