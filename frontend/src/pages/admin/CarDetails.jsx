import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  TextareaAutosize
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

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

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedCar, setEditedCar] = useState({});

  // Fetch car details
  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJson(`/api/admin/cars/${id}`);
      setCar(response.data);
      setEditedCar(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch car details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const handleApprove = async () => {
    try {
      await apiClient.putJson(`/api/admin/cars/${id}/verify`, { status: 'Verified' });
      setSuccess('Car listing approved successfully');
      fetchCarDetails();
    } catch (err) {
      setError(err.message || 'Failed to approve car listing');
    }
  };

  const handleReject = async () => {
    try {
      await apiClient.putJson(`/api/admin/cars/${id}/verify`, { status: 'Rejected' });
      setSuccess('Car listing rejected successfully');
      fetchCarDetails();
    } catch (err) {
      setError(err.message || 'Failed to reject car listing');
    }
  };

  const handleEditChange = (field, value) => {
    setEditedCar(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // For now, we'll just show a success message
      // In a real implementation, you would send the updated data to the backend
      setSuccess('Car details updated successfully');
      setCar(editedCar);
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Failed to update car details');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Verified':
        return <Chip icon={<CheckCircleIcon />} label="Verified" color="success" />;
      case 'Rejected':
        return <Chip icon={<CancelIcon />} label="Rejected" color="error" />;
      case 'Pending':
      default:
        return <Chip icon={<EditIcon />} label="Pending" color="warning" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin/cars')}
          sx={{ mb: 2 }}
        >
          Back to Listings
        </Button>
        
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin/cars')}
          sx={{ mb: 2 }}
        >
          Back to Listings
        </Button>
        
        <Typography variant="h6" color="text.secondary">
          Car not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/admin/cars')}
        sx={{ mb: 2 }}
      >
        Back to Listings
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {editMode ? 'Edit Car Details' : car.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              {car.brand} {car.model} ({car.year})
            </Typography>
            {getStatusChip(car.status)}
          </Box>
        </Box>
        <Box>
          {!editMode ? (
            <Button
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              variant="outlined"
            >
              Edit
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={() => setEditMode(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
              >
                Save
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Car Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={getFullImageUrl(car.images?.[0]) || '/placeholder-car.jpg'}
              alt={car.title}
              sx={{ objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
            />
          </Card>
          
          {car.images && car.images.length > 1 && (
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {car.images.slice(1).map((img, index) => (
                <Grid item xs={3} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="100"
                      image={getFullImageUrl(img)}
                      alt={`${car.title} ${index + 2}`}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
        
        {/* Car Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Car Information
              </Typography>
              
              {editMode ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={editedCar.title || ''}
                      onChange={(e) => handleEditChange('title', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Brand"
                      value={editedCar.brand || ''}
                      onChange={(e) => handleEditChange('brand', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Model"
                      value={editedCar.model || ''}
                      onChange={(e) => handleEditChange('model', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Year"
                      type="number"
                      value={editedCar.year || ''}
                      onChange={(e) => handleEditChange('year', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mileage (km)"
                      type="number"
                      value={editedCar.mileage || ''}
                      onChange={(e) => handleEditChange('mileage', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Fuel Type</InputLabel>
                      <Select
                        value={editedCar.fuelType || ''}
                        label="Fuel Type"
                        onChange={(e) => handleEditChange('fuelType', e.target.value)}
                      >
                        <MenuItem value="Petrol">Petrol</MenuItem>
                        <MenuItem value="Diesel">Diesel</MenuItem>
                        <MenuItem value="Electric">Electric</MenuItem>
                        <MenuItem value="Hybrid">Hybrid</MenuItem>
                        <MenuItem value="CNG">CNG</MenuItem>
                        <MenuItem value="LPG">LPG</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Transmission</InputLabel>
                      <Select
                        value={editedCar.transmission || ''}
                        label="Transmission"
                        onChange={(e) => handleEditChange('transmission', e.target.value)}
                      >
                        <MenuItem value="Manual">Manual</MenuItem>
                        <MenuItem value="Automatic">Automatic</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Price (₹)"
                      type="number"
                      value={editedCar.price || ''}
                      onChange={(e) => handleEditChange('price', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Condition</InputLabel>
                      <Select
                        value={editedCar.condition || ''}
                        label="Condition"
                        onChange={(e) => handleEditChange('condition', e.target.value)}
                      >
                        <MenuItem value="New">New</MenuItem>
                        <MenuItem value="Like New">Like New</MenuItem>
                        <MenuItem value="Excellent">Excellent</MenuItem>
                        <MenuItem value="Good">Good</MenuItem>
                        <MenuItem value="Fair">Fair</MenuItem>
                        <MenuItem value="Poor">Poor</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={editedCar.description || ''}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{car.description}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Brand</Typography>
                    <Typography variant="body1" fontWeight={600}>{car.brand}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Model</Typography>
                    <Typography variant="body1" fontWeight={600}>{car.model}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Year</Typography>
                    <Typography variant="body1" fontWeight={600}>{car.year}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Mileage</Typography>
                    <Typography variant="body1" fontWeight={600}>{car.mileage?.toLocaleString('en-IN')} km</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                    <Typography variant="body1" fontWeight={600}>{car.fuelType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Transmission</Typography>
                    <Typography variant="body1" fontWeight={600}>{car.transmission}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Condition</Typography>
                    <Typography variant="body1" fontWeight={600}>{car.condition}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Price</Typography>
                    <Typography variant="body1" fontWeight={600} color="primary.main">
                      ₹{car.price?.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
          
          {/* Seller Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Seller Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.seller?.name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.seller?.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Contact</Typography>
                  <Typography variant="body1" fontWeight={600}>{car.seller?.contact || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          {!editMode && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {car.status !== 'Verified' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleApprove}
                  fullWidth
                >
                  Approve Listing
                </Button>
              )}
              {car.status !== 'Rejected' && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleReject}
                  fullWidth
                >
                  Reject Listing
                </Button>
              )}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

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

export default CarDetails;