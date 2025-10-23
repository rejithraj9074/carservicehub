import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const SimpleCarListings = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch car listings
  const fetchCarListings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJson('/api/cars');
      console.log('API Response:', response);
      setCars(response.data || []);
    } catch (err) {
      console.error('Error fetching car listings:', err);
      setError(err.message || 'Failed to fetch car listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarListings();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading car listings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Simple Car Listings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Minimal car listing page for debugging
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography>Total cars: {cars.length}</Typography>
      </Box>

      {cars.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No cars found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cars.map((car) => (
            <Grid item xs={12} sm={6} md={4} key={car._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{car.title}</Typography>
                  <Typography>Brand: {car.brand}</Typography>
                  <Typography>Model: {car.model}</Typography>
                  <Typography>Year: {car.year}</Typography>
                  <Typography>Price: ₹{car.price?.toLocaleString('en-IN')}</Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate(`/cars/${car._id}`)}
                    sx={{ mt: 1 }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SimpleCarListings;