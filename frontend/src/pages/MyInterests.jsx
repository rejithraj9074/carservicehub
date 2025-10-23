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
  IconButton,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Pagination
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/client';

const MyInterests = () => {
  const navigate = useNavigate();
  const [interestedCars, setInterestedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch user's interested cars
  const fetchInterestedCars = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJson('/api/interested/user');
      setInterestedCars(response.data || []);
      setTotalPages(Math.ceil(response.count / 12) || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch your interests');
      // Clear the cars list on error
      setInterestedCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestedCars();
  }, [page]);

  const removeInterest = async (carId) => {
    try {
      await apiClient.postJson('/api/interested', { carId });
      setSuccess('Car removed from your interests!');
      fetchInterestedCars(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Failed to remove interest');
    }
  };

  const handleViewDetails = (carId) => {
    navigate(`/cars/${carId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Interested Cars
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Cars you've marked as interested
          </Typography>
        </Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/cars')}
          variant="outlined"
        >
          Back to Car Listings
        </Button>
      </Box>

      {interestedCars.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FavoriteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            You haven't marked any cars as interested yet
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/cars')}
          >
            Browse Cars
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {interestedCars.map((interest) => (
              <Grid item xs={12} sm={6} md={4} key={interest._id}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewDetails(interest.carId)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={interest.image || '/placeholder-car.jpg'}
                      alt={interest.title}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="h6" fontWeight={700} noWrap>
                            {interest.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {interest.brand} {interest.model} ({interest.year})
                          </Typography>
                        </Box>
                        <IconButton
                          sx={{
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 0, 0, 0.2)',
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeInterest(interest.carId);
                          }}
                        >
                          <DeleteIcon sx={{ color: 'red' }} />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" fontWeight={700} color="primary">
                          ₹{interest.price?.toLocaleString('en-IN')}
                        </Typography>
                        <Chip 
                          label={interest.condition || 'Good'} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(30, 58, 138, 0.1)',
                            color: '#1E3A8A'
                          }} 
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Added: {new Date(interest.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(e, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

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

export default MyInterests;