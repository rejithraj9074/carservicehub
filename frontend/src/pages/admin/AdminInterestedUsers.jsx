import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const AdminInterestedUsers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [carDetails, setCarDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch interested users for a specific car
  const fetchInterestedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJson(`/api/interested/${id}`);
      setUsers(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch interested users');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch car details
  const fetchCarDetails = useCallback(async () => {
    try {
      const response = await apiClient.getJson(`/api/cars/${id}`);
      setCarDetails(response.data);
    } catch (err) {
      // Silently fail if car details can't be fetched
    }
  }, [id]);

  useEffect(() => {
    fetchInterestedUsers();
    fetchCarDetails();
  }, [id, fetchInterestedUsers, fetchCarDetails]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/admin/interested-cars')}
        sx={{ mb: 2 }}
      >
        Back to Interested Cars
      </Button>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Interested Users
        </Typography>
        {carDetails && (
          <Typography variant="subtitle1" color="text.secondary">
            Users interested in: {carDetails.title} ({carDetails.brand} {carDetails.model})
          </Typography>
        )}
      </Box>

      <Card>
        <CardContent>
          {users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No users interested in this car
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Interest Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user.userId?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.userId?.email || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.userId?.phone || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CalendarTodayIcon />}
                          label={new Date(user.createdAt).toLocaleDateString()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
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

export default AdminInterestedUsers;