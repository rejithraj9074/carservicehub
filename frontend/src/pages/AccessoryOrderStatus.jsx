import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  LocalShipping,
  Cancel,
  ShoppingCart,
  Receipt,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const AccessoryOrderStatus = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getJson('/api/accessory-orders/user');
        setOrders(response.data || []);
      } catch (err) {
        setError('Failed to fetch order history. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const handleViewDetails = (orderId) => {
    navigate(`/accessory-order/${orderId}`);
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
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
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
            onClick={handleBackToDashboard}
            sx={{ 
              backgroundColor: theme.palette.grey[100],
              '&:hover': { backgroundColor: theme.palette.grey[200] }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight={700}>
            My Accessory Orders
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={() => navigate('/store/accessories')}
          sx={{
            backgroundColor: '#1E3A8A',
            '&:hover': { backgroundColor: '#3B82F6' }
          }}
        >
          Shop Accessories
        </Button>
      </Stack>

      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Receipt sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No accessory orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't placed any accessory orders. Start shopping now!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/store/accessories')}
            sx={{
              backgroundColor: '#1E3A8A',
              '&:hover': { backgroundColor: '#3B82F6' }
            }}
          >
            Browse Accessories
          </Button>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow 
                    key={order._id} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight={600}>
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.items?.length || 0} item(s)
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{order.totalAmount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(order.status)}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(order._id)}
                        >
                          View
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default AccessoryOrderStatus;