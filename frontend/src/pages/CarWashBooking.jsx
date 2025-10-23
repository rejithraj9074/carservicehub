import React, { useRef, useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, TextField, MenuItem, Button, Divider, Snackbar, Alert, Chip, Stack, Stepper, Step, StepLabel, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowBack, LocalCarWash, AutoAwesome, CleaningServices, WaterDrop, DirectionsCar, Payment as PaymentIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import apiClient from '../api/client';
import { loadRazorpayScript } from '../utils/razorpay';

const SERVICE_TYPES = ['Basic', 'Premium', 'Interior & Exterior', 'Exterior Only', 'Interior Deep Clean'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    price: 399,
    icon: <LocalCarWash sx={{ color: '#0B5FFF' }} />,
    features: ['Exterior rinse', 'Foam wash', 'Tyre shine'],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 799,
    icon: <AutoAwesome sx={{ color: '#0B5FFF' }} />,
    features: ['Exterior foam + wax', 'Interior vacuum', 'Dashboard polish', 'Tyre & rim care'],
  },
  {
    key: 'interior_exterior',
    name: 'Interior & Exterior',
    price: 999,
    icon: <CleaningServices sx={{ color: '#0B5FFF' }} />,
    features: ['Full exterior wash', 'Full interior vacuum', 'Glass cleaning', 'Fragrance spray'],
  },
  {
    key: 'exterior_only',
    name: 'Exterior Only',
    price: 499,
    icon: <WaterDrop sx={{ color: '#0B5FFF' }} />,
    features: ['Pressure wash', 'Shampoo & rinse', 'Quick dry'],
  },
  {
    key: 'interior_deep_clean',
    name: 'Interior Deep Clean',
    price: 1299,
    icon: <DirectionsCar sx={{ color: '#0B5FFF' }} />,
    features: ['Seat shampoo', 'Carpet & mat wash', 'AC vent cleaning', 'Odor removal'],
  },
];

const STEPS = ['Select Service', 'Booking Details', 'Payment', 'Confirmation'];

const CarWashBooking = () => {
  const locationState = useLocation().state || {};
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    serviceType: locationState.serviceType || '',
    date: '',
    timeSlot: '',
    location: 'workshop',
    carModel: '',
    plateNumber: ''
  });
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Load Razorpay script
  useEffect(() => {
    const loadScript = async () => {
      const loaded = await loadRazorpayScript();
      setRazorpayLoaded(loaded);
      if (!loaded) {
        setToast({ open: true, type: 'error', message: 'Failed to load payment gateway. Please try again later.' });
      }
    };
    
    loadScript();
  }, []);
  
  const getServicePrice = (serviceType) => {
    const plan = PLANS.find(p => p.name === serviceType);
    return plan ? plan.price : 0;
  };
  
  const handleNext = () => {
    if (activeStep === 1) {
      // Validate form before proceeding to payment
      if (!form.serviceType || !form.date || !form.timeSlot || !form.carModel || !form.plateNumber) {
        setToast({ open: true, type: 'error', message: 'Please fill in all required fields' });
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
  
  const createBooking = async () => {
    try {
      setLoading(true);
      const payload = {
        carDetails: { model: form.carModel, plateNumber: form.plateNumber },
        serviceType: form.serviceType,
        date: form.date,
        timeSlot: form.timeSlot,
        location: form.location
      };
      const response = await apiClient.postJson('/api/carwash', payload);
      setBookingId(response.booking._id);
      return response.booking._id;
    } catch (e) {
      setToast({ open: true, type: 'error', message: e?.message || 'Failed to create booking' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePlan = (name) => {
    setForm((prev) => ({ ...prev, serviceType: name }));
    // Move to next step
    setActiveStep(1);
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      setToast({ open: true, type: 'error', message: 'Payment gateway is still loading. Please try again in a moment.' });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create booking if not already created
      let currentBookingId = bookingId;
      if (!currentBookingId) {
        currentBookingId = await createBooking();
        if (!currentBookingId) {
          return;
        }
      }
      
      // Create Razorpay order
      const paymentResponse = await apiClient.postJson('/api/carwash/payment/order', {
        bookingId: currentBookingId
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
        description: "Car Wash Service",
        order_id: razorpayOrderId,
        handler: async function (response) {
          console.log('Razorpay payment response:', JSON.stringify(response, null, 2));
          
          // Verify payment on backend
          try {
            const verifyResponse = await apiClient.postJson('/api/carwash/payment/verify', {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: currentBookingId
            });
            
            console.log('Payment verification response:', JSON.stringify(verifyResponse, null, 2));
            
            if (verifyResponse.success) {
              setActiveStep(3); // Move to confirmation step
            } else {
              setToast({ open: true, type: 'error', message: verifyResponse.message || 'Payment verification failed' });
            }
          } catch (verifyError) {
            console.error('Error verifying payment:', verifyError);
            setToast({ open: true, type: 'error', message: 'Payment verification failed: ' + (verifyError.message || 'Unknown error') });
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
            setToast({ open: true, type: 'info', message: 'Payment was cancelled' });
            setLoading(false);
          }
        }
      };
      
      console.log('Initializing Razorpay with options:', JSON.stringify(options, null, 2));
      
      // Check if key is present
      if (!options.key) {
        console.error('Razorpay key is missing!');
        setToast({ open: true, type: 'error', message: 'Payment configuration error: Missing Razorpay key' });
        setLoading(false);
        return;
      }
      
      const rzp = new window.Razorpay(options);
      
      // Handle payment errors
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', JSON.stringify(response, null, 2));
        setToast({ open: true, type: 'error', message: 'Payment failed: ' + (response.error.description || 'Unknown error') });
        setLoading(false);
      });
      
      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      setToast({ open: true, type: 'error', message: error.message || 'Failed to initiate payment' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoToDashboard = () => {
    navigate('/customer');
  };
  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {PLANS.map((plan) => (
              <Grid key={plan.key} item xs={12} sm={6} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    backgroundColor: '#f8fafc',
                    position: 'relative',
                    boxShadow: '0 4px 16px rgba(2, 6, 23, 0.06)',
                    height: '100%',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        background: '#e8f0ff',
                        color: '#0B5FFF',
                      }}
                    >
                      {plan.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#0A2540' }}>
                      {plan.name}
                    </Typography>
                  </Stack>

                  <Chip
                    label={`₹ ${plan.price}`}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: '#0B5FFF',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  />

                  <Box component="ul" sx={{ pl: 2, mb: 2, mt: 1 }}>
                    {plan.features.map((f) => (
                      <Typography key={f} component="li" variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        {f}
                      </Typography>
                    ))}
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleChoosePlan(plan.name)}
                    sx={{
                      mt: 'auto',
                      py: 1.25,
                      fontWeight: 700,
                      borderRadius: 2,
                      backgroundColor: '#0B5FFF',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#0949c6' },
                    }}
                  >
                    Select
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', boxShadow: '0 4px 16px rgba(2, 6, 23, 0.06)' }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: '#0A2540' }}>Booking Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Service Type"
                      value={form.serviceType}
                      onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                    >
                      {SERVICE_TYPES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date"
                      InputLabelProps={{ shrink: true }}
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Time Slot"
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                    >
                      {TIME_SLOTS.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    >
                      <MenuItem value="workshop">Workshop</MenuItem>
                      <MenuItem value="doorstep">Doorstep</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Car Model"
                      value={form.carModel}
                      onChange={(e) => setForm({ ...form, carModel: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Plate Number"
                      value={form.plateNumber}
                      onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', boxShadow: '0 4px 16px rgba(2, 6, 23, 0.06)' }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#0A2540' }}>Summary</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">Service: {form.serviceType || '-'}</Typography>
                <Typography variant="body2">Price: ₹{getServicePrice(form.serviceType).toLocaleString('en-IN')}</Typography>
                <Typography variant="body2">Date: {form.date || '-'}</Typography>
                <Typography variant="body2">Time: {form.timeSlot || '-'}</Typography>
                <Typography variant="body2">Location: {form.location}</Typography>
                <Typography variant="body2">Car: {form.carModel || '-'} / {form.plateNumber || '-'}</Typography>
              </Paper>
            </Grid>
          </Grid>
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
                Total Amount:
              </Typography>
              <Typography variant="h6" color="primary">
                ₹{getServicePrice(form.serviceType).toLocaleString('en-IN')}
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
              Thank you for your booking. Your car wash service has been booked successfully.
            </Typography>
            <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto', mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Booking ID:</strong> {bookingId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Service:</strong> {form.serviceType}
              </Typography>
              <Typography variant="body2">
                <strong>Total Amount:</strong> ₹{getServicePrice(form.serviceType).toLocaleString('en-IN')}
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

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'saturate(180%) blur(6px)',
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid',
          borderColor: 'grey.100',
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            onClick={() => activeStep === 0 ? navigate('/customer') : handleBack()}
            startIcon={<ArrowBack />} 
            disabled={loading}
            sx={{ 
              color: '#0B5FFF', 
              fontWeight: 600, 
              textTransform: 'none',
              minWidth: 'auto',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#0B5FFF'
              }
            }}
          >
            {activeStep === 0 ? 'Back' : 'Back'}
          </Button>
          <Box sx={{ flex: 1, textAlign: 'center', mr: 6 }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#0A2540' }}>
              Car Wash Services
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Book your car wash service
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stepper */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
        {/* Error Alert */}
        {toast.type === 'error' && toast.open && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setToast({ ...toast, open: false })}>
            {toast.message}
          </Alert>
        )}

        {/* Step Content */}
        {getStepContent(activeStep)}

        {/* Navigation Buttons */}
        {activeStep < 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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
              {activeStep === 2 ? 'Pay Now' : 'Next'}
            </Button>
          </Box>
        )}

        <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.type} onClose={() => setToast({ ...toast, open: false })}>{toast.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CarWashBooking;