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
  TextField,
  CircularProgress,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/client';

const SecondHandCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    brand: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });
  const [userInterests, setUserInterests] = useState(new Set());

  // Fetch car listings
  const fetchCarListings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching car listings with filters:', filters);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.minYear && { minYear: filters.minYear }),
        ...(filters.maxYear && { maxYear: filters.maxYear }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.search && { search: filters.search })
      });

      console.log('API Request URL:', `/api/cars?${params}`);
      
      const response = await apiClient.getJson(`/api/cars?${params}`);
      console.log('API Response:', response);
      
      setCars(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      console.error('Error fetching car listings:', err);
      setError(err.message || 'Failed to fetch car listings');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  // Fetch user interests
  const fetchUserInterests = useCallback(async () => {
    try {
      const response = await apiClient.getJson('/api/interested/user');
      const interestedCarIds = new Set(response.data.map(item => item.carId));
      setUserInterests(interestedCarIds);
    } catch (err) {
      // If user is not logged in or error occurs, clear interests
      setUserInterests(new Set());
    }
  }, []);

  useEffect(() => {
    fetchCarListings();
    fetchUserInterests();
  }, [page, filters, fetchCarListings, fetchUserInterests]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchCarListings();
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      minYear: '',
      maxYear: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    });
  };

  const toggleInterest = async (carId) => {
    try {
      const response = await apiClient.postJson('/api/interested', { carId });
      
      // Update local state
      if (response.interested) {
        setUserInterests(prev => new Set(prev).add(carId));
        setSuccess('Car added to your interests!');
      } else {
        setUserInterests(prev => {
          const newSet = new Set(prev);
          newSet.delete(carId);
          return newSet;
        });
        setSuccess('Car removed from your interests!');
      }
      
      // Refresh the data
      fetchUserInterests();
    } catch (err) {
      setError(err.message || 'Failed to update interest');
    }
  };

  const handleViewDetails = (carId) => {
    navigate(`/cars/${carId}`);
  };

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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/customer')}
            sx={{ 
              whiteSpace: 'nowrap',
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(30, 58, 138, 0.08)',
                borderColor: 'primary.main'
              }
            }}
          >
            Back to Dashboard
          </Button>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Second-Hand Cars
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Browse our collection of verified second-hand cars
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FavoriteIcon />}
          onClick={() => navigate('/my-interests')}
          sx={{ 
            whiteSpace: 'nowrap',
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(30, 58, 138, 0.08)',
              borderColor: 'primary.main'
            }
          }}
        >
          My Interested Cars
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search cars..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
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
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Brand"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={applyFilters}
              sx={{ height: 56 }}
            >
              Apply
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: 56 }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Debug info */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Debug Information</Typography>
          <Typography>Total cars: {cars.length}</Typography>
          <Typography>Current page: {page}</Typography>
          <Typography>Total pages: {totalPages}</Typography>
        </CardContent>
      </Card>

      {/* Car Listings Grid */}
      {cars.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No cars found matching your criteria
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={clearFilters}
            startIcon={<ArrowBackIcon />}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {cars.map((car) => (
              <Grid item xs={12} sm={6} md={4} key={car._id}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => handleViewDetails(car._id)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={car.images?.[0] || '/placeholder-car.jpg'}
                      alt={car.title}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleInterest(car._id);
                      }}
                    >
                      {userInterests.has(car._id) ? (
                        <FavoriteIcon sx={{ color: 'red' }} />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={700} noWrap>
                        {car.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {car.brand} {car.model} ({car.year})
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" fontWeight={700} color="primary">
                          ₹{car.price?.toLocaleString('en-IN')}
                        </Typography>
                        <Chip 
                          label={car.condition} 
                          size="small" 
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
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                        {car.mileage?.toLocaleString('en-IN')} km
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

export default SecondHandCars;