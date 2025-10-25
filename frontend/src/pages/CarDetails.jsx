import React, { useState, useEffect, useCallback } from 'react';
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocalGasStation,
  Settings,
  CalendarToday,
  Speed,
  Email,
  Phone,
  Person
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

// Get the API base URL for constructing image URLs
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// Helper function to construct full image URLs
const getFullImageUrl = (imagePath) => {
  // If it's already a full URL, return as is
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  
  // If it's a relative path, construct the full URL
  if (imagePath && imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Return the original path if we can't construct a full URL
  return imagePath;
};

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInterested, setIsInterested] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Fetch car details
  const fetchCarDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJson(`/api/cars/${id}`);
      setCar(response.data);
      
      // Check if user is interested in this car
      try {
        const interestResponse = await apiClient.getJson('/api/interested/user');
        const interestedCars = interestResponse.data.map(item => item.carId);
        setIsInterested(interestedCars.includes(id));
      } catch (err) {
        // If user is not logged in or error occurs, set interest to false
        setIsInterested(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch car details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCarDetails();
  }, [id, fetchCarDetails]);

  const toggleInterest = async () => {
    try {
      const response = await apiClient.postJson('/api/interested', { carId: id });
      
      if (response.interested) {
        setIsInterested(true);
        setSuccess('Car added to your interests!');
      } else {
        setIsInterested(false);
        setSuccess('Car removed from your interests!');
      }
    } catch (err) {
      setError(err.message || 'Failed to update interest');
    }
  };

  const handleContactSeller = () => {
    setContactModalOpen(true);
  };

  const closeContactModal = () => {
    setContactModalOpen(false);
  };

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

  if (!car) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6">Car not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/cars')}
          variant="outlined"
        >
          Back to Listings
        </Button>
        <Button
          startIcon={<FavoriteIcon />}
          onClick={() => navigate('/my-interests')}
          variant="outlined"
          sx={{ 
            borderColor: isInterested ? 'red' : 'inherit',
            color: isInterested ? 'red' : 'inherit',
            '&:hover': {
              backgroundColor: isInterested ? 'rgba(255, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              borderColor: isInterested ? 'red' : 'inherit'
            }
          }}
        >
          My Interested Cars
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        {/* Car Images */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={getFullImageUrl(car.images?.[0]) || '/placeholder-car.jpg'}
              alt={car.title}
              sx={{ objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
            />
          </Card>
          
          {car.images && car.images.length > 1 && (
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {car.images.slice(1).map((img, index) => (
                <Grid item xs={3} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="100"
                      image={getFullImageUrl(img)}
                      alt={`${car.title} ${index + 2}`}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
        
        {/* Car Details */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {car.title}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={700}>
                    ₹{car.price?.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <IconButton
                  onClick={toggleInterest}
                  sx={{
                    backgroundColor: isInterested ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      backgroundColor: isInterested ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  {isInterested ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  icon={<CalendarToday />} 
                  label={`${car.year}`} 
                  variant="outlined" 
                  size="small"
                />
                <Chip 
                  icon={<LocalGasStation />} 
                  label={car.fuelType} 
                  variant="outlined" 
                  size="small"
                />
                <Chip 
                  icon={<Settings />} 
                  label={car.transmission} 
                  variant="outlined" 
                  size="small"
                />
                <Chip 
                  icon={<Speed />} 
                  label={car.mileage?.toLocaleString('en-IN') + ' km'} 
                  variant="outlined" 
                  size="small"
                />
              </Box>
              
              <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                {car.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Seller Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {car.seller?.name || 'Not specified'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {car.seller?.email || 'Not specified'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {car.seller?.contact || 'Not specified'}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleContactSeller}
              >
                Contact Seller
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Car Condition
              </Typography>
              <Chip 
                label={car.condition} 
                color={
                  car.condition === 'New' || car.condition === 'Like New' ? 'success' :
                  car.condition === 'Excellent' || car.condition === 'Good' ? 'primary' :
                  car.condition === 'Fair' ? 'warning' : 'error'
                }
                sx={{ fontWeight: 'bold' }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Contact Seller Modal */}
      <Dialog open={contactModalOpen} onClose={closeContactModal} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Seller</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            To contact the seller about this car, please reach out using the information below:
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Seller Name:</Typography>
            <Typography variant="body1">{car.seller?.name || 'Not specified'}</Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Email:</Typography>
            <Typography variant="body1">
              {car.seller?.email ? (
                <a href={`mailto:${car.seller.email}`}>{car.seller.email}</a>
              ) : 'Not specified'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2">Phone:</Typography>
            <Typography variant="body1">
              {car.seller?.contact ? (
                <a href={`tel:${car.seller.contact}`}>{car.seller.contact}</a>
              ) : 'Not specified'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeContactModal}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Snackbars */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CarDetails;