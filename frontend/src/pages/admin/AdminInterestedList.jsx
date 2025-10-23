import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const AdminInterestedList = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all interests
  const fetchAllInterests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJson('/api/interested');
      
      // Check if response is successful
      if (response && response.success !== undefined) {
        if (response.success) {
          setInterests(response.data || []);
        } else {
          setError(response.message || 'Failed to fetch interests');
        }
      } else {
        // Handle case where response doesn't have success property
        if (Array.isArray(response)) {
          setInterests(response);
        } else if (response && response.data) {
          setInterests(response.data);
        } else {
          setInterests([]);
        }
      }
    } catch (err) {
      console.error('Error fetching interests:', err);
      setError(err.message || 'Failed to fetch interests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInterests();
  }, []);

  const handleViewUsers = (carId) => {
    navigate(`/admin/interested-cars/${carId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2, mt: 2 }}>Loading interested cars...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Interested Cars
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Cars with user interest statistics
        </Typography>
      </Box>

      <Card>
        <CardContent>
          {interests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No interests found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                There are currently no users interested in any cars.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                    <TableCell>Car Image</TableCell>
                    <TableCell>Car Details</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Interested Users</TableCell>
                    <TableCell>Latest Interest</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {interests.map((interest) => (
                    <TableRow key={interest.carId} hover>
                      <TableCell>
                        <CardMedia
                          component="img"
                          sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1 }}
                          image={interest.image || '/placeholder-car.jpg'}
                          alt={interest.title}
                          onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {interest.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {interest.brand} {interest.model}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{interest.year}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          ₹{interest.price?.toLocaleString('en-IN') || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={interest.count}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {interest.latestInterest ? new Date(interest.latestInterest).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewUsers(interest.carId)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminInterestedList;