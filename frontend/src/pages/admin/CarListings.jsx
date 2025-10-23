import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Pagination,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const CarListings = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    brand: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    status: '',
    search: ''
  });
  const [selectedCar, setSelectedCar] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Add car functionality
  const [openAddDialog, setOpenAddDialog] = useState(false);
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

  // Fetch car listings
  const fetchCarListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.minYear && { minYear: filters.minYear }),
        ...(filters.maxYear && { maxYear: filters.maxYear }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await apiClient.getJson(`/api/admin/cars?${params}`);
      setCars(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch car listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarListings();
  }, [page, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchCarListings();
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      minYear: '',
      maxYear: '',
      minPrice: '',
      maxPrice: '',
      status: '',
      search: ''
    });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Verified':
        return <Chip icon={<CheckCircleIcon />} label="Verified" color="success" size="small" />;
      case 'Rejected':
        return <Chip icon={<CancelIcon />} label="Rejected" color="error" size="small" />;
      case 'Pending':
      default:
        return <Chip icon={<FilterIcon />} label="Pending" color="warning" size="small" />;
    }
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setDetailDialogOpen(true);
  };

  const handleApprove = async (carId) => {
    try {
      await apiClient.putJson(`/api/admin/cars/${carId}/verify`, { status: 'Verified' });
      setSuccess('Car listing approved successfully');
      fetchCarListings();
    } catch (err) {
      setError(err.message || 'Failed to approve car listing');
    }
  };

  const handleReject = async (carId) => {
    try {
      await apiClient.putJson(`/api/admin/cars/${carId}/verify`, { status: 'Rejected' });
      setSuccess('Car listing rejected successfully');
      fetchCarListings();
    } catch (err) {
      setError(err.message || 'Failed to reject car listing');
    }
  };

  const handleDelete = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car listing?')) {
      try {
        await apiClient.deleteJson(`/api/admin/cars/${carId}`);
        setSuccess('Car listing deleted successfully');
        fetchCarListings();
      } catch (err) {
        setError(err.message || 'Failed to delete car listing');
      }
    }
  };

  // Handle form input changes for adding new car
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
    
    // In a real implementation, you would handle file uploads
    // For now, we'll just store the file names
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

  // Handle form submission for adding new car
  const handleAddCarSubmit = async (e) => {
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
      setOpenAddDialog(false);
      
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
      
      // Refresh the car listings
      fetchCarListings();
    } catch (err) {
      setError(err.message || 'Failed to create car listing');
    }
  };

  // Close add dialog and reset form
  const closeAddDialog = () => {
    setOpenAddDialog(false);
    // Reset form when closing
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
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Car Listings
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage second-hand car listings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add New Car
        </Button>
      </Box>

      {/* Tabs for different views */}
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)} 
        sx={{ mb: 3 }}
      >
        <Tab label="All Listings" />
        <Tab label="Pending" />
        <Tab label="Verified" />
        <Tab label="Rejected" />
      </Tabs>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search cars..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Year"
              type="number"
              value={filters.minYear}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Max Year"
              type="number"
              value={filters.maxYear}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Verified">Verified</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Brand"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={applyFilters}
              sx={{ height: 56 }}
            >
              Apply
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: 56 }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Car Listings Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                    <TableCell>Image</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Seller</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cars.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No car listings found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cars.map((car) => (
                      <TableRow key={car._id} hover>
                        <TableCell>
                          <img 
                            src={car.images?.[0] || '/placeholder-car.jpg'} 
                            alt={car.title}
                            style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }}
                            onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={car.title}>
                            <Typography variant="subtitle2" fontWeight={600} noWrap>
                              {car.title}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            ₹{car.price?.toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{car.brand}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{car.year}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{car.seller?.name || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(car.status)}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewDetails(car)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {car.status !== 'Verified' && (
                              <Tooltip title="Approve">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleApprove(car._id)}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {car.status !== 'Rejected' && (
                              <Tooltip title="Reject">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleReject(car._id)}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDelete(car._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Add Car Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={closeAddDialog}
        maxWidth="md"
        fullWidth
        scroll="body"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add New Car Listing</Typography>
            <IconButton onClick={closeAddDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleAddCarSubmit}>
            <Grid container spacing={3}>
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
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeAddDialog}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            onClick={handleAddCarSubmit}
            sx={{ ml: 2 }}
          >
            Create Car Listing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Car Details Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Car Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedCar && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <img 
                  src={selectedCar.images?.[0] || '/placeholder-car.jpg'} 
                  alt={selectedCar.title}
                  style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8 }}
                  onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {selectedCar.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {selectedCar.description}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Brand</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.brand}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Model</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.model}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Year</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.year}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Mileage</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.mileage?.toLocaleString('en-IN')} km</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.fuelType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Transmission</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.transmission}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Condition</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.condition}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Price</Typography>
                    <Typography variant="body1" fontWeight={600} color="primary.main">
                      ₹{selectedCar.price?.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    {getStatusChip(selectedCar.status)}
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 2 }}>
                  Seller Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.seller?.name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.seller?.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Contact</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedCar.seller?.contact || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {selectedCar && selectedCar.status !== 'Verified' && (
            <Button 
              onClick={() => {
                handleApprove(selectedCar._id);
                setDetailDialogOpen(false);
              }} 
              variant="contained" 
              color="success"
            >
              Approve
            </Button>
          )}
          {selectedCar && selectedCar.status !== 'Rejected' && (
            <Button 
              onClick={() => {
                handleReject(selectedCar._id);
                setDetailDialogOpen(false);
              }} 
              variant="contained" 
              color="error"
            >
              Reject
            </Button>
          )}
        </DialogActions>
      </Dialog>

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

export default CarListings;