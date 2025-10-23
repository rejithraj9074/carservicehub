import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Skeleton,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

const AccessoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accessory, setAccessory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cart, setCart] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('accessoriesCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('accessoriesCart', JSON.stringify(cart));
  }, [cart]);

  const fetchAccessory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJson(`/api/accessories/${id}`);
      setAccessory(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch accessory');
      showSnackbar('Failed to load accessory details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAccessory();
  }, [id, fetchAccessory]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const addToCart = () => {
    if (!accessory) return;

    const newCart = [...cart];
    const existingItemIndex = newCart.findIndex(item => item._id === accessory._id);
    
    if (existingItemIndex >= 0) {
      newCart[existingItemIndex].quantity += quantity;
    } else {
      newCart.push({ ...accessory, quantity });
    }
    
    setCart(newCart);
    showSnackbar(`${accessory.name} added to cart`, 'success');
  };

  const incrementQuantity = () => {
    if (accessory && quantity < accessory.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={30} width="60%" />
            <Skeleton variant="text" height={200} sx={{ mt: 2 }} />
            <Skeleton variant="text" height={60} sx={{ mt: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!accessory) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          Accessory not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" color="inherit">
          Home
        </MuiLink>
        <MuiLink component={Link} to="/store/accessories" color="inherit">
          Accessories
        </MuiLink>
        <Typography color="text.primary">{accessory.name}</Typography>
      </Breadcrumbs>
      
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/store/accessories')} sx={{ mb: 2 }}>
        Back to Store
      </Button>
      
      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {accessory.image ? (
              <CardMedia
                component="img"
                height="400"
                image={accessory.image}
                alt={accessory.name}
                sx={{ objectFit: 'contain' }}
              />
            ) : (
              <Box 
                sx={{ 
                  height: 400, 
                  backgroundColor: '#f5f5f5', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <CategoryIcon sx={{ fontSize: 120, color: 'text.secondary' }} />
              </Box>
            )}
          </Card>
        </Grid>
        
        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {accessory.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip 
                label={accessory.category} 
                color="primary" 
                variant="outlined"
              />
              {accessory.brand && (
                <Chip 
                  label={accessory.brand} 
                  variant="outlined"
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    sx={{ 
                      fontSize: 20, 
                      color: i < 4 ? '#FFD700' : '#E0E0E0' 
                    }} 
                  />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">
                (128 reviews)
              </Typography>
            </Box>
            
            <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mb: 3 }}>
              ₹{accessory.price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {accessory.description}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1" fontWeight={600}>
                Availability:
              </Typography>
              <Typography 
                variant="body1" 
                color={accessory.stock > 0 ? 'success.main' : 'error.main'}
              >
                {accessory.stock > 0 ? `${accessory.stock} in stock` : 'Out of stock'}
              </Typography>
            </Box>
            
            {accessory.stock > 0 && (
              <>
                {/* Quantity Selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Quantity:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1 }}>
                    <IconButton 
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ px: 2, minWidth: 30, textAlign: 'center' }}>
                      {quantity}
                    </Typography>
                    <IconButton 
                      onClick={incrementQuantity}
                      disabled={quantity >= accessory.stock}
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Add to Cart Button */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={addToCart}
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    fontSize: '1rem',
                    borderRadius: 2,
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  Add to Cart
                </Button>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
      
      {/* Product Specifications */}
      <Card sx={{ mt: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Product Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>SKU:</strong> {accessory.sku || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Category:</strong> {accessory.category}
              </Typography>
            </Grid>
            {accessory.brand && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Brand:</strong> {accessory.brand}
                </Typography>
              </Grid>
            )}
            {accessory.weight && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Weight:</strong> {accessory.weight} kg
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccessoryDetail;