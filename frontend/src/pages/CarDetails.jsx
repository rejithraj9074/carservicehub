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
              image={car.images?.[0] || '/placeholder-car.jpg'}
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
                      image={img}
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
                      backgroundColor: isInterested ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  {isInterested ? (
                    <FavoriteIcon sx={{ color: 'red' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={car.condition} 
                  sx={{ 
                    backgroundColor: 
                      car.condition === 'New' ? '#10b981' :
                      car.condition === 'Like New' ? '#3b82f6' :
                      car.condition === 'Excellent' ? '#8b5cf6' :
                      car.condition === 'Good' ? '#f59e0b' :
                      '#ef4444',
                    color: 'white'
                  }} 
                />
                <Chip 
                  icon={<LocalGasStation />} 
                  label={car.fuelType} 
                  variant="outlined" 
                />
                <Chip 
                  icon={<Settings />} 
                  label={car.transmission} 
                  variant="outlined" 
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Brand</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.brand}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Model</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.model}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Year</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.year}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Mileage</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.mileage?.toLocaleString('en-IN')} km</Typography>
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, py: 1.5 }}
                onClick={handleContactSeller}
              >
                Contact Seller
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {car.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Features */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Key Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Year</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.year}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Mileage</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.mileage?.toLocaleString('en-IN')} km</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalGasStation sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.fuelType}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Transmission</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.transmission}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contact Seller Modal */}
      <Dialog open={contactModalOpen} onClose={closeContactModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div" fontWeight={700}>
            Contact Seller
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You can contact the seller of this vehicle using the information below:
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Seller Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {car.seller?.name || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {car.seller?.email || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {car.seller?.contact || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Note: The seller will be notified that you are interested in their vehicle. 
                Please mention the vehicle details when contacting them.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeContactModal} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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

export default CarDetails;