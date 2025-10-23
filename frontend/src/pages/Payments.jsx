import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Cancel as XCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { downloadInvoice } from '../utils/invoiceGenerator';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get user ID from localStorage
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  };

  const user = getUser();
  const userId = user?._id || user?.id;

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJson(`/api/payments/user/${userId}`);
      
      if (response.success) {
        // Ensure we have an array, even if empty
        setPayments(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.message || 'Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to fetch payments');
      // Set empty array on error to prevent UI issues
      setPayments([]);
      showSnackbar('Failed to load payment history', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchPayments();
    } else {
      setError('User not found. Please log in again.');
      setLoading(false);
    }
  }, [userId, fetchPayments]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownloadReceipt = async (payment) => {
    try {
      console.log('Payment object:', JSON.stringify(payment, null, 2));
      
      // Check if this is a car wash payment
      if (payment.isCarWash) {
        // For car wash payments, we already have the necessary data
        const transactionData = {
          _id: payment.order._id,
          orderNumber: payment.order.orderNumber,
          totalAmount: payment.order.totalAmount,
          createdAt: payment.createdAt,
          paymentStatus: 'Paid',
          paymentMethod: payment.method,
          serviceType: payment.description.replace('Car Wash Service - ', ''),
          items: [] // Car wash doesn't have items like accessories
        };
        
        console.log('Car wash transaction data for invoice:', JSON.stringify(transactionData, null, 2));
        
        downloadInvoice(transactionData, user);
        showSnackbar('Invoice downloaded successfully!', 'success');
        return;
      }
      
      // Check if payment has order data
      if (!payment.order || !payment.order._id) {
        throw new Error('Order information is missing from payment data');
      }
      
      // Fetch the full order details to get item names and other information
      const orderResponse = await apiClient.getJson(`/api/accessory-orders/${payment.order._id}`);
      
      if (orderResponse.success) {
        // Combine payment and order data for the invoice
        const transactionData = {
          ...orderResponse.data,
          paymentId: payment.razorpayPaymentId,
          paymentMethod: payment.method
        };
        
        console.log('Transaction data for invoice:', JSON.stringify(transactionData, null, 2));
        
        downloadInvoice(transactionData, user);
        showSnackbar('Invoice downloaded successfully!', 'success');
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showSnackbar('Failed to download invoice: ' + (error.message || 'Unknown error'), 'error');
    }
  };
  
  const getPaymentDescription = (payment) => {
    if (payment.isCarWash) {
      return payment.description || 'Car Wash Service';
    }
    return `Accessory Order #${payment.order?.orderNumber || 'N/A'}`;
  };
  
  const getPaymentAmount = (payment) => {
    if (payment.amount) {
      return payment.amount;
    }
    return payment.order?.totalAmount || 0;
  };
  
  const getPaymentId = (payment) => {
    if (payment.isCarWash) {
      return payment.razorpayPaymentId || 'N/A';
    }
    return payment.razorpayPaymentId;
  };
  
  const getPaymentMethod = (payment) => {
    return payment.method?.toUpperCase() || 'N/A';
  };
  
  const getPaymentDate = (payment) => {
    return formatDate(payment.createdAt);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'captured':
        return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" size="small" />;
      case 'created':
        return <Chip icon={<ClockIcon />} label="Pending" color="warning" size="small" />;
      case 'failed':
        return <Chip icon={<XCircleIcon />} label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Ensure payments is always an array
  const safePayments = Array.isArray(payments) ? payments : [];
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/customer')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Dashboard
        </Button>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Payment History
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage your payment transactions
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Payment Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight={700}>
              {safePayments.length}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Total Payments
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              ₹{safePayments
                .filter(p => p && (p.status === 'captured' || p.isCarWash))
                .reduce((sum, p) => sum + (p?.amount || p?.order?.totalAmount || 0), 0)
                .toLocaleString('en-IN')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Total Spent
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {safePayments.filter(p => p && (p.status === 'captured' || p.isCarWash)).length}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Successful Payments
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Payments List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Recent Transactions
          </Typography>
          
          {safePayments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No payment history found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your payment transactions will appear here
              </Typography>
            </Box>
          ) : (
            <List>
              {safePayments.map((payment) => (
                <React.Fragment key={payment._id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Payment for Order #{payment.order?.orderNumber || 'N/A'}
                          </Typography>
                          {getStatusChip(payment.status)}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.primary">
                            ₹{getPaymentAmount(payment).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getPaymentDescription(payment)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Payment ID: {getPaymentId(payment)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Method: {getPaymentMethod(payment)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getPaymentDate(payment)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="download"
                        onClick={() => handleDownloadReceipt(payment)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
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

export default Payments;