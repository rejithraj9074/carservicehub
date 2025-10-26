import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Chip,
  Divider,
  Grid,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Pending,
  LocalShipping,
  Cancel,
  LocationOn,
  CalendarToday,
  LocalOffer
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
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

const AccessoryOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getJson(`/api/accessory-orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        setError('Failed to fetch order details. Please try again later.');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const getStatusChip = (status) => {
    const statusConfig = {
      Pending: { icon: <Pending />, color: 'warning', label: 'Pending' },
      Processing: { icon: <Pending />, color: 'info', label: 'Processing' },
      Shipped: { icon: <LocalShipping />, color: 'primary', label: 'Shipped' },
      Delivered: { icon: <CheckCircle />, color: 'success', label: 'Delivered' },
      Cancelled: { icon: <Cancel />, color: 'error', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.Pending;
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="medium"
        sx={{ 
          fontWeight: 600,
          fontSize: '1rem',
          height: 32
        }}
      />
    );
  };

  const handleBack = () => {
    navigate('/accessory-orders');
  };

  const handleBackToDashboard = () => {
    navigate('/customer');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={handleBack}
          >
            Back to Orders
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Order not found
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleBack}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={3}
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton 
            onClick={handleBack}
            sx={{ 
              backgroundColor: theme.palette.grey[100],
              '&:hover': { backgroundColor: theme.palette.grey[200] }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Order Details
          </Typography>
        </Stack>
        {getStatusChip(order.status)}
      </Stack>

      <Grid container spacing={3}>
        {/* Order Summary */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: 2, p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Order Summary
            </Typography>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" color="text.secondary">
                Order Number
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {order.orderNumber}
              </Typography>
            </Stack>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" color="text.secondary">
                Order Date
              </Typography>
              <Typography variant="body1">
                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </Typography>
            </Stack>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body1" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1">
                {order.paymentMethod}
              </Typography>
            </Stack>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body1" color="text.secondary">
                Payment Status
              </Typography>
              <Chip 
                label={order.paymentStatus} 
                size="small" 
                color={order.paymentStatus === 'Paid' ? 'success' : 'warning'} 
              />
            </Stack>
          </Paper>

          {/* Items */}
          <Paper elevation={0} sx={{ borderRadius: 2, p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom mb={2}>
              Items
            </Typography>
            
            {order.items?.map((item, index) => (
              <Box key={index} mb={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {item.accessory?.image ? (
                    <img 
                      src={getFullImageUrl(item.accessory.image)} 
                      alt={item.accessory.name}
                      style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: 8, 
                        backgroundColor: theme.palette.grey[200],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <LocalOffer />
                    </Box>
                  )}
                  <Box flexGrow={1}>
                    <Typography variant="body1" fontWeight={600}>
                      {item.accessory?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Stack>
                {index < order.items.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={600} color="primary">
                ₹{order.totalAmount?.toFixed(2)}
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Order Information */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ borderRadius: 2, p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Shipping Information
            </Typography>
            
            <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={2}>
              <LocationOn sx={{ color: theme.palette.grey[600], mt: 0.5 }} />
              <Box>
                <Typography variant="body1" fontWeight={600} mb={0.5}>
                  Delivery Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress?.street}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress?.country}
                </Typography>
              </Box>
            </Stack>
            
            {order.trackingNumber && (
              <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={2}>
                <LocalShipping sx={{ color: theme.palette.grey[600], mt: 0.5 }} />
                <Box>
                  <Typography variant="body1" fontWeight={600} mb={0.5}>
                    Tracking Number
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.trackingNumber}
                  </Typography>
                </Box>
              </Stack>
            )}
            
            {order.estimatedDelivery && (
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <CalendarToday sx={{ color: theme.palette.grey[600], mt: 0.5 }} />
                <Box>
                  <Typography variant="body1" fontWeight={600} mb={0.5}>
                    Estimated Delivery
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Paper>

          {order.notes && (
            <Paper elevation={0} sx={{ borderRadius: 2, p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Order Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.notes}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to Orders
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default AccessoryOrderDetail;