import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  Alert,
  Snackbar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  ShoppingCartCheckout as ShoppingCartCheckoutIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

const AccessoriesStore = () => {
  const navigate = useNavigate();
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const categories = ['Interior', 'Exterior', 'Electronics', 'Other'];

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('accessoriesCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('accessoriesCart', JSON.stringify(cart));
  }, [cart]);

  const fetchAccessories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      });

      const response = await apiClient.getJson(`/api/accessories?${params}`);
      setAccessories(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch accessories');
      showSnackbar('Failed to load accessories', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, categoryFilter]);

  // Fetch accessories
  useEffect(() => {
    fetchAccessories();
  }, [page, searchQuery, categoryFilter, fetchAccessories]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const addToCart = (accessory) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === accessory._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === accessory._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...accessory, quantity: 1 }];
      }
    });
    showSnackbar(`${accessory.name} added to cart`, 'success');
  };

  const removeFromCart = (accessoryId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== accessoryId));
    showSnackbar('Item removed from cart', 'info');
  };

  const updateQuantity = (accessoryId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === accessoryId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showSnackbar('Your cart is empty', 'warning');
      return;
    }
    // Navigate to checkout page
    navigate('/accessory-checkout');
  };

  const clearCart = () => {
    setCart([]);
    showSnackbar('Cart cleared', 'info');
  };

  // Loading skeletons
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/customer')}
              startIcon={<ArrowBackIcon />}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" fontWeight={700}>
              Car Accessories Store
            </Typography>
          </Box>
          <Badge badgeContent={getTotalItems()} color="primary">
            <IconButton onClick={() => setCartOpen(true)} size="large">
              <ShoppingCartIcon />
            </IconButton>
          </Badge>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 4, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          </Grid>
        </Card>

        {/* Accessories Grid */}
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={40} />
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Skeleton variant="text" width={60} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/customer')}
            startIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Car Accessories Store
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Premium quality accessories for your vehicle
            </Typography>
          </Box>
        </Box>
        <Badge badgeContent={getTotalItems()} color="primary">
          <IconButton 
            onClick={() => setCartOpen(true)} 
            size="large"
            sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
          >
            <ShoppingCartIcon />
          </IconButton>
        </Badge>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 2, boxShadow: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon sx={{ fontSize: 18 }} />
                      {category}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={fetchAccessories}
              sx={{ height: 56 }}
            >
              Apply Filters
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              sx={{ height: 56 }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Accessories Grid */}
      {accessories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No accessories found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {accessories.map((accessory) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={accessory._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  },
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                {accessory.image ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={getFullImageUrl(accessory.image)}
                    alt={accessory.name}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      height: 200, 
                      backgroundColor: '#f5f5f5', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <CategoryIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" fontWeight={600} noWrap>
                      {accessory.name}
                    </Typography>
                    {accessory.brand && (
                      <Chip 
                        label={accessory.brand} 
                        size="small" 
                        variant="outlined" 
                        sx={{ height: 20 }} 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {accessory.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => removeFromCart(accessory._id)} size="small">
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="body2" fontWeight={600}>
                      {accessory.price.toFixed(2)}$
                    </Typography>
                    <IconButton onClick={() => addToCart(accessory)} size="small">
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => addToCart(accessory)}
                    sx={{ height: 40 }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={(e, value) => setPage(value)}
        color="primary"
        sx={{ mt: 4 }}
      />

      {/* Cart Dialog */}
      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Shopping Cart
            </Typography>
            <IconButton onClick={clearCart}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {cart.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
            </Box>
          ) : (
            <List>
              {cart.map((item) => (
                <ListItem key={item._id}>
                  <ListItemText
                    primary={item.name}
                    secondary={`Price: ${item.price.toFixed(2)}$`}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton onClick={() => updateQuantity(item._id, item.quantity - 1)} size="small">
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body2" fontWeight={600}>
                        {item.quantity}
                      </Typography>
                      <IconButton onClick={() => updateQuantity(item._id, item.quantity + 1)} size="small">
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Items: {getTotalItems()}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  Total Price: {getTotalPrice().toFixed(2)}$
                </Typography>
              </Box>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCartOpen(false)} color="primary">
            Close
          </Button>
          <Button onClick={handleCheckout} variant="contained" color="primary">
            Checkout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        severity={snackbar.severity}
      />
    </Container>
  );
};

export default AccessoriesStore;
