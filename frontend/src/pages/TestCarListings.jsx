import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField
} from '@mui/material';
import apiClient from '../api/client';

const TestCarListings = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    brand: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  // Fetch car listings
  const fetchCarListings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching car listings with filters:', filters);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.minYear && { minYear: filters.minYear }),
        ...(filters.maxYear && { maxYear: filters.maxYear }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.search && { search: filters.search })
      });

      console.log('Query parameters:', params.toString());
      
      // Try the API endpoint directly
      const response = await apiClient.getJson(`/api/cars?${params}`);
      console.log('API Response:', response);
      
      setApiResponse(response);
      setCars(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching car listings:', err);
      setError(err.message || 'Failed to fetch car listings');
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchCarListings();
  };

  useEffect(() => {
    fetchCarListings();
  }, [fetchCarListings]);

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
          Test Car Listings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Debugging car listing functionality
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Brand"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Year"
              type="number"
              value={filters.minYear}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Max Year"
              type="number"
              value={filters.maxYear}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">API Response Details</Typography>
          <Typography>Success: {apiResponse?.success ? 'Yes' : 'No'}</Typography>
          <Typography>Total cars: {cars.length}</Typography>
          <Typography>Pagination pages: {apiResponse?.pagination?.pages}</Typography>
          <Typography>Pagination total: {apiResponse?.pagination?.total}</Typography>
          <Typography>Current page: {apiResponse?.pagination?.current}</Typography>
        </CardContent>
      </Card>

      {cars.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No cars found in the response
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={fetchCarListings}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Cars Found: {cars.length}
          </Typography>
          <Grid container spacing={2}>
            {cars.map((car) => (
              <Grid item xs={12} md={6} key={car._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{car.title}</Typography>
                    <Typography>Brand: {car.brand}</Typography>
                    <Typography>Model: {car.model}</Typography>
                    <Typography>Year: {car.year}</Typography>
                    <Typography>Price: ₹{car.price?.toLocaleString('en-IN')}</Typography>
                    <Typography>Status: {car.status}</Typography>
                    <Typography>Description: {car.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default TestCarListings;