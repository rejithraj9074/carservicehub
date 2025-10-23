import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const AddCar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    price: '',
    description: '',
    condition: '',
    images: [],
    seller: {
      name: '',
      email: '',
      contact: ''
    }
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSellerChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      seller: { ...prev.seller, [field]: value }
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 10) {
      setError('You can upload maximum 10 images');
      return;
    }
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.title || !formData.brand || !formData.model || !formData.year || 
          !formData.mileage || !formData.fuelType || !formData.transmission || 
          !formData.price || !formData.description || !formData.condition) {
        setError('Please fill all required fields');
        return;
      }
      
      if (!formData.seller.name || !formData.seller.email || !formData.seller.contact) {
        setError('Please fill all seller information');
        return;
      }
      
      // Create FormData object for multipart submission
      const form = new FormData();
      form.append('title', formData.title);
      form.append('brand', formData.brand);
      form.append('model', formData.model);
      form.append('year', formData.year);
      form.append('mileage', formData.mileage);
      form.append('fuelType', formData.fuelType);
      form.append('transmission', formData.transmission);
      form.append('price', formData.price);
      form.append('description', formData.description);
      form.append('condition', formData.condition);
      
      // Add seller information
      form.append('seller[name]', formData.seller.name);
      form.append('seller[email]', formData.seller.email);
      form.append('seller[contact]', formData.seller.contact);
      
      // Add images if any
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          form.append('images', image);
        });
      }
      
      // Submit to API
      await apiClient.postMultipart('/api/admin/cars', form);
      
      setSuccess('Car listing created successfully');
      
      // Reset form
      setFormData({
        title: '',
        brand: '',
        model: '',
        year: '',
        mileage: '',
        fuelType: '',
        transmission: '',
        price: '',
        description: '',
        condition: '',
        images: [],
        seller: {
          name: '',
          email: '',
          contact: ''
        }
      });
      setImagePreviews([]);
      
      // Navigate back to listings after 2 seconds
      setTimeout(() => {
        navigate('/admin/cars');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create car listing');
    }
  };

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
            Add New Car Listing
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create a new second-hand car listing
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Car Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Car Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title *"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Brand *"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Model *"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Year *"
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      required
                      InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mileage (km) *"
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => handleInputChange('mileage', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Fuel Type *</InputLabel>
                      <Select
                        value={formData.fuelType}
                        label="Fuel Type *"
                        onChange={(e) => handleInputChange('fuelType', e.target.value)}
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
                    <FormControl fullWidth required>
                      <InputLabel>Transmission *</InputLabel>
                      <Select
                        value={formData.transmission}
                        label="Transmission *"
                        onChange={(e) => handleInputChange('transmission', e.target.value)}
                      >
                        <MenuItem value="Manual">Manual</MenuItem>
                        <MenuItem value="Automatic">Automatic</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Price (₹) *"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Condition *</InputLabel>
                      <Select
                        value={formData.condition}
                        label="Condition *"
                        onChange={(e) => handleInputChange('condition', e.target.value)}
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
                      label="Description *"
                      multiline
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
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
                    <TextField
                      fullWidth
                      label="Seller Name *"
                      value={formData.seller.name}
                      onChange={(e) => handleSellerChange('name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Seller Email *"
                      type="email"
                      value={formData.seller.email}
                      onChange={(e) => handleSellerChange('email', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Seller Contact *"
                      value={formData.seller.contact}
                      onChange={(e) => handleSellerChange('contact', e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Image Upload */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Car Images
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    multiple
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AddPhotoIcon />}
                      fullWidth
                    >
                      Upload Images
                    </Button>
                  </label>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Upload up to 10 images (Max 5MB each)
                  </Typography>
                </Box>
                
                {imagePreviews.length > 0 && (
                  <Grid container spacing={1}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ position: 'relative' }}>
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                          />
                          <IconButton
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: 4, 
                              right: 4, 
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                            }}
                            onClick={() => removeImage(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
            
            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
            >
              Create Car Listing
            </Button>
          </Grid>
        </Grid>
      </form>

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

export default AddCar;