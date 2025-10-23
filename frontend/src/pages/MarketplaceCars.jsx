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
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  LocalGasStation,
  Settings,
  Speed,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/client';

const MarketplaceCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'priceLow', 'priceHigh'
  
  const [filters, setFilters] = useState({
    brand: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    fuelType: '',
    transmission: ''
  });

  const [userInterests, setUserInterests] = useState(new Set());

  // Available brands (you might want to fetch this from the API)
  const availableBrands = ['Maruti', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Ford', 'Volkswagen', 'Mahindra', 'Renault', 'Nissan', 'Skoda', 'Kia'];
  
  // Fuel types
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
  
  // Transmissions
  const transmissions = ['Manual', 'Automatic'];

  // Fetch car listings
  const fetchCarListings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: viewMode === 'grid' ? '12' : '10',
        sortBy: sortBy,
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.minYear && { minYear: filters.minYear }),
        ...(filters.maxYear && { maxYear: filters.maxYear }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.search && { search: filters.search }),
        ...(filters.fuelType && { fuelType: filters.fuelType }),
        ...(filters.transmission && { transmission: filters.transmission })
      });

      const response = await apiClient.getJson(`/api/cars?${params}`);
      
      if (response.success) {
        setCars(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotalCars(response.pagination?.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch car listings');
      }
    } catch (err) {
      console.error('Error fetching car listings:', err);
      setError(err.message || 'Failed to fetch car listings. Please try again.');
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters, sortBy, viewMode]);

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
  }, [page, filters, sortBy, viewMode, fetchCarListings, fetchUserInterests]);

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
      search: '',
      fuelType: '',
      transmission: ''
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
      setError(err.message || 'Failed to update interest. Please try again.');
    }
  };

  const handleViewDetails = (carId) => {
    navigate(`/cars/${carId}`);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  if (loading && cars.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading premium car listings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ background: 'linear-gradient(45deg, #1e3a8a, #2563eb)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Car Marketplace
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Discover your perfect ride from our curated collection of verified vehicles
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<FavoriteIcon />}
            onClick={() => navigate('/my-interests')}
            sx={{ 
              borderRadius: 3,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(45deg, #1e3a8a, #2563eb)',
              boxShadow: '0 4px 20px rgba(30, 58, 138, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
                boxShadow: '0 6px 25px rgba(30, 58, 138, 0.4)',
              }
            }}
          >
            My Interested Cars
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Showing {cars.length} of {totalCars} vehicles
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newViewMode) => newViewMode && setViewMode(newViewMode)}
              size="small"
              sx={{ height: 40 }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="priceLow">Price: Low to High</MenuItem>
                <MenuItem value="priceHigh">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3, background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid rgba(30, 58, 138, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>Filter Vehicles</Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              placeholder="Search by keyword..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              select
              label="Brand"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <MenuItem value=""><em>All Brands</em></MenuItem>
              {availableBrands.map((brand) => (
                <MenuItem key={brand} value={brand}>{brand}</MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              label="Min Year"
              type="number"
              value={filters.minYear}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
              InputProps={{
                startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              label="Max Year"
              type="number"
              value={filters.maxYear}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
              InputProps={{
                startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              label="Min Price (₹)"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              label="Max Price (₹)"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              select
              label="Fuel Type"
              value={filters.fuelType}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
            >
              <MenuItem value=""><em>All Fuel Types</em></MenuItem>
              {fuelTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              select
              label="Transmission"
              value={filters.transmission}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
            >
              <MenuItem value=""><em>All Transmissions</em></MenuItem>
              {transmissions.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ px: 3 }}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={applyFilters}
                sx={{ px: 4, background: 'linear-gradient(45deg, #1e3a8a, #2563eb)' }}
              >
                Apply Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Car Listings */}
      {cars.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            No vehicles match your search
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your filters or search criteria
          </Typography>
          <Button
            variant="contained"
            startIcon={<FilterIcon />}
            onClick={clearFilters}
            sx={{ 
              px: 4, 
              py: 1.5,
              background: 'linear-gradient(45deg, #1e3a8a, #2563eb)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
              }
            }}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          {viewMode === 'grid' ? (
            // Grid View
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
                        position: 'relative',
                        overflow: 'visible',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                      onClick={() => handleViewDetails(car._id)}
                    >
                      {/* Favorite Button */}
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          zIndex: 10,
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease'
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
                      
                      {/* Car Image */}
                      <CardMedia
                        component="img"
                        height="200"
                        image={car.images?.[0] || '/placeholder-car.jpg'}
                        alt={car.title}
                        sx={{ objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                      />
                      
                      {/* Car Details */}
                      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="h6" fontWeight={700} noWrap>
                            {car.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {car.brand} {car.model} • {car.year}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h5" fontWeight={800} color="primary">
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
                              color: 'white',
                              fontWeight: 600
                            }} 
                          />
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Speed sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {car.mileage?.toLocaleString('en-IN') || 'N/A'} km
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocalGasStation sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {car.fuelType || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Settings sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {car.transmission || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarToday sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {car.year || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            // List View
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cars.map((car) => (
                <Card 
                  key={car._id}
                  sx={{ 
                    display: 'flex',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                    }
                  }}
                  onClick={() => handleViewDetails(car._id)}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 250, objectFit: 'cover' }}
                    image={car.images?.[0] || '/placeholder-car.jpg'}
                    alt={car.title}
                    onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                  />
                  
                  <Box sx={{ display: 'flex', flexGrow: 1 }}>
                    <CardContent sx={{ flexGrow: 1, py: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h5" fontWeight={700} gutterBottom>
                            {car.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            {car.brand} {car.model} • {car.year}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Speed sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {car.mileage?.toLocaleString('en-IN') || 'N/A'} km
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocalGasStation sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {car.fuelType || 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Settings sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {car.transmission || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                            ₹{car.price?.toLocaleString('en-IN')}
                          </Typography>
                          <Chip 
                            label={car.condition} 
                            sx={{ 
                              backgroundColor: 
                                car.condition === 'New' ? '#10b981' :
                                car.condition === 'Like New' ? '#3b82f6' :
                                car.condition === 'Excellent' ? '#8b5cf6' :
                                car.condition === 'Good' ? '#f59e0b' :
                                '#ef4444',
                              color: 'white',
                              fontWeight: 600,
                              mb: 2
                            }} 
                          />
                          
                          <IconButton
                            sx={{
                              backgroundColor: userInterests.has(car._id) ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                              '&:hover': {
                                backgroundColor: userInterests.has(car._id) ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
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
                        </Box>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              ))}
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(e, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 600,
                  },
                  '& .Mui-selected': {
                    background: 'linear-gradient(45deg, #1e3a8a, #2563eb)',
                  }
                }}
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
        <Alert 
          severity="success" 
          onClose={() => setSuccess('')}
          sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontWeight: 600
          }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            fontWeight: 600
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MarketplaceCars;