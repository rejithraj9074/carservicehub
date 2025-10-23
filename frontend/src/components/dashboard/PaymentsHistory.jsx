import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Button, Stack, CircularProgress } from '@mui/material';
import apiClient from '../../api/client';

const PaymentsHistory = ({ onDownload }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (userId) {
      fetchRecentPayments();
    }
  }, [userId]);

  const fetchRecentPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJson(`/api/payments/user/${userId}`);
      
      if (response.success) {
        // Get only the 5 most recent payments
        const recentPayments = (response.data || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setPayments(recentPayments);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card 
        sx={{ 
          borderRadius: 3, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }} 
        elevation={2}
      >
        <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={28} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        borderRadius: 3, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
        }
      }} 
      elevation={2}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#1E3A8A' }}>Payment History</Typography>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {payments.map((p, idx) => (
            <ListItem 
              key={p._id || idx} 
              divider 
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => onDownload?.(p)}
                    sx={{ 
                      borderColor: '#1E3A8A', 
                      color: '#1E3A8A',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 0.5,
                      '&:hover': {
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(28, 58, 138, 0.04)'
                      }
                    }}
                  >
                    Receipt
                  </Button>
                </Stack>
              }
              sx={{ 
                py: 2,
                px: 0,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                }
              }}
            >
              <ListItemText 
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Order #{p.order?.orderNumber || 'N/A'}
                  </Typography>
                } 
                secondary={
                  <>
                    <Typography component="span" variant="body1" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.5 }}>
                      ₹{p.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {formatDate(p.createdAt)} • {p.method?.toUpperCase() || 'N/A'} • {p.razorpayPaymentId?.substring(0, 10) || 'N/A'}...
                    </Typography>
                  </>
                } 
              />
            </ListItem>
          ))}
          {payments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No payments found.
            </Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default PaymentsHistory;