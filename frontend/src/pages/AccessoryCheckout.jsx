import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient, { postJsonPublic } from '../api/client';
import { loadRazorpayScript } from '../utils/razorpay';

const steps = ['Cart Review', 'Shipping Information', 'Payment', 'Confirmation'];

const AccessoryCheckout = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderId, setOrderId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Shipping information state
  const [shippingInfo, setShippingInfo] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('accessoriesCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // If no cart, redirect to store
      navigate('/accessories');
    }
  }, [navigate]);

  // Load Razorpay script
  useEffect(() => {
    const loadScript = async () => {
      const loaded = await loadRazorpayScript();
      setRazorpayLoaded(loaded);
      if (!loaded) {
        showSnackbar('Failed to load payment gateway. Please try again later.', 'error');
      }
    };
    
    loadScript();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate shipping information
      if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
        showSnackbar('Please fill in all shipping information', 'error');
        return;
      }
    }
    
    if (activeStep === 2) {
      // Proceed to payment
      handlePayment();
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleShippingInfoChange = (field, value) => {
    setShippingInfo({
      ...shippingInfo,
      [field]: value
    });
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      
      // Get user from localStorage (in a real app, this would come from auth context)
      const userString = localStorage.getItem('user');
      let userId = null;
      
      if (userString) {
        try {
          const user = JSON.parse(userString);
          userId = user._id || user.id;
          console.log('User ID found:', userId);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      } else {
        console.log('No user data found in localStorage');
      }
      
      // Validate shipping address
      if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
        throw new Error('Please fill in all shipping address fields');
      }
      
      // Prepare order data (without orderNumber as it will be auto-generated)
      const orderData = {
        items: cart.map(item => ({
          accessory: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getTotalPrice(),
        shippingAddress: {
          street: shippingInfo.street,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country || 'India'
        },
        paymentMethod: 'Razorpay', // Now a valid enum value
      };
      
      // Add user ID if available
      if (userId) {
        orderData.user = userId;
      }
      
      console.log('Order data being sent:', JSON.stringify(orderData, null, 2));
      
      // Create order in backend
      const response = await apiClient.postJson('/api/accessory-orders', orderData);
      console.log('Order creation response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        setOrderId(response.data._id);
        return response.data._id;
      } else {
        // Show detailed error messages
        let errorMessage = response.message || 'Failed to create order';
        if (response.errors && Array.isArray(response.errors)) {
          const errorDetails = response.errors.map(error => {
            if (typeof error === 'string') {
              return error;
            } else if (error.field && error.message) {
              return `${error.field}: ${error.message}`;
            } else {
              return JSON.stringify(error);
            }
          }).join(', ');
          errorMessage += ': ' + errorDetails;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showSnackbar(error.message || 'Failed to create order', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      showSnackbar('Payment gateway is still loading. Please try again in a moment.', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Debug: Log the Razorpay key
      console.log('Razorpay Key ID from env:', process.env.REACT_APP_RAZORPAY_KEY_ID);
      
      // Create order if not already created
      let currentOrderId = orderId;
      if (!currentOrderId) {
        currentOrderId = await createOrder();
        if (!currentOrderId) {
          return;
        }
      }
      
      // Create Razorpay order
      const paymentResponse = await apiClient.postJson('/api/payment/order', {
        orderId: currentOrderId
      });
      
      console.log('Payment order response:', JSON.stringify(paymentResponse, null, 2));
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Failed to create payment order');
      }
      
      const { orderId: razorpayOrderId, amount } = paymentResponse.data;
      
      // Get user info for prefill
      const userString = localStorage.getItem('user');
      let userName = 'Customer';
      let userEmail = 'customer@example.com';
      
      if (userString) {
        try {
          const user = JSON.parse(userString);
          userName = user.name || userName;
          userEmail = user.email || userEmail;
        } catch (parseError) {
          console.error('Error parsing user data for prefill:', parseError);
        }
      }
      
      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RGXWGOBliVCIpU', // Fallback to hardcoded key
        amount: amount,
        currency: "INR",
        name: "CarvoHub",
        description: "Accessory Purchase",
        order_id: razorpayOrderId,
        handler: async function (response) {
          console.log('Razorpay payment response:', JSON.stringify(response, null, 2));
          
          // Verify payment on backend (using public endpoint without auth)
          try {
            const verifyResponse = await postJsonPublic('/api/payment/verify', {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              orderId: currentOrderId
            });
            
            console.log('Payment verification response:', JSON.stringify(verifyResponse, null, 2));
            
            if (verifyResponse.success) {
              setPaymentId(response.razorpay_payment_id);
              setActiveStep(3); // Move to confirmation step
              // Clear cart
              localStorage.removeItem('accessoriesCart');
            } else {
              showSnackbar(verifyResponse.message || 'Payment verification failed', 'error');
            }
          } catch (verifyError) {
            console.error('Error verifying payment:', verifyError);
            showSnackbar('Payment verification failed: ' + (verifyError.message || 'Unknown error'), 'error');
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#3B82F6"
        },
        modal: {
          ondismiss: function() {
            console.log('Payment dialog closed by user');
            showSnackbar('Payment was cancelled', 'info');
            setLoading(false);
          }
        }
      };
      
      console.log('Initializing Razorpay with options:', JSON.stringify(options, null, 2));
      
      // Check if key is present
      if (!options.key) {
        console.error('Razorpay key is missing!');
        showSnackbar('Payment configuration error: Missing Razorpay key', 'error');
        setLoading(false);
        return;
      }
      
      const rzp = new window.Razorpay(options);
      
      // Handle payment errors
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', JSON.stringify(response, null, 2));
        showSnackbar('Payment failed: ' + (response.error.description || 'Unknown error'), 'error');
        setLoading(false);
      });
      
      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      showSnackbar(error.message || 'Failed to initiate payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review your cart items
            </Typography>
            <List>
              {cart.map((item) => (
                <ListItem key={item._id}>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Quantity: {item.quantity}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    }
                  />
                  <Typography variant="body1" fontWeight={700}>
                    ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h6">
                Total ({getTotalItems()} items):
              </Typography>
              <Typography variant="h6" color="primary">
                ₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Shipping Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={shippingInfo.street}
                  onChange={(e) => handleShippingInfoChange('street', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={shippingInfo.city}
                  onChange={(e) => handleShippingInfoChange('city', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={shippingInfo.state}
                  onChange={(e) => handleShippingInfoChange('state', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ZIP / Postal Code"
                  value={shippingInfo.zipCode}
                  onChange={(e) => handleShippingInfoChange('zipCode', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={shippingInfo.country}
                    label="Country"
                    onChange={(e) => handleShippingInfoChange('country', e.target.value)}
                  >
                    <MenuItem value="India">India</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PaymentIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Secure Payment
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You will be redirected to Razorpay to complete your payment securely.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h6">
                Order Total:
              </Typography>
              <Typography variant="h6" color="primary">
                ₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Thank you for your purchase. Your order has been placed successfully.
            </Typography>
            <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto', mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Order ID:</strong> {orderId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Payment ID:</strong> {paymentId}
              </Typography>
              <Typography variant="body2">
                <strong>Total Amount:</strong> ₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              onClick={handleGoToDashboard}
              sx={{ mt: 2 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  // Add this function to handle navigation to dashboard
  const handleGoToDashboard = () => {
    navigate('/customer');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => activeStep === 0 ? navigate('/store/accessories') : handleBack()}
          startIcon={<ArrowBackIcon />}
          disabled={loading}
          sx={{
            borderRadius: '8px',
            padding: '8px 16px',
            borderColor: '#e0e0e0',
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          {activeStep === 0 ? 'Back to Store' : 'Back'}
        </Button>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Checkout
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Complete your purchase
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Alert */}
      {snackbar.severity === 'error' && snackbar.open && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      )}

      {/* Content */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          {getStepContent(activeStep)}
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading || (activeStep === 2 && !razorpayLoaded)}
            endIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {activeStep === steps.length - 1 ? 'Go to Dashboard' : 
             activeStep === steps.length - 2 ? 'Pay Now' : 
             'Next'}
          </Button>
        </CardActions>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

export default AccessoryCheckout;