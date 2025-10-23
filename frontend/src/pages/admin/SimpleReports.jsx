import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import apiClient from '../../api/client';

const SimpleReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch basic statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch only the most basic stats to test
      const overviewStats = await apiClient.getJson('/api/admin/overview');
      
      setStats({
        overviewStats: overviewStats.stats
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2, mt: 1 }}>
            Loading basic reports...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Simple Reports Test
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Basic test to verify reports functionality
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <br />
          <Button onClick={fetchStats} variant="contained" sx={{ mt: 1 }}>
            Retry
          </Button>
        </Alert>
      )}

      {stats?.overviewStats ? (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {stats.overviewStats.users}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Mechanics
                </Typography>
                <Typography variant="h3" fontWeight={700} color="info.main">
                  {stats.overviewStats.mechanics}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Bookings
                </Typography>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  {stats.overviewStats.bookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Car Wash Bookings
                </Typography>
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {stats.overviewStats.carWashBookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  ₹{stats.overviewStats.revenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">
          No data available. Please try again.
        </Alert>
      )}
    </Container>
  );
};

export default SimpleReports;