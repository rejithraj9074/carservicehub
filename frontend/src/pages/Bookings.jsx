import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import ActiveBookings from '../components/dashboard/ActiveBookings';
import apiClient from '../api/client';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.getJson('/api/bookings?limit=50');
        setBookings(res.bookings || []);
      } catch (e) {
        // ignore for now
      }
    };
    load();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Your Bookings</Typography>
        <Typography variant="body2" color="text.secondary">View and manage your active and recent bookings</Typography>
      </Box>
      <ActiveBookings bookings={bookings} />
    </Container>
  );
};

export default Bookings;


