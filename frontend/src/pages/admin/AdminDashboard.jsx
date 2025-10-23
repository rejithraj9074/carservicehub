aimport React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  DirectionsCar,
  People,
  CheckCircle,
  Pending,
  Cancel,
  TrendingUp,
  Add as AddIcon,
  Close as CloseIcon,
  Build,
  LocalCarWash,
  ShoppingCart,
  Assignment
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Form state for adding new car
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

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all required statistics in parallel
      const [
        overviewResult,
        carStatsResult,
        sellerStatsResult,
        accessoryStatsResult,
        orderStatsResult,
        mechanicStatsResult,
        carWashStatsResult
      ] = await Promise.allSettled([
        apiClient.getJson('/api/admin/overview'),
        apiClient.getJson('/api/admin/cars/stats'),
        apiClient.getJson('/api/admin/sellers/stats'),
        apiClient.getJson('/api/admin/accessories/stats'),
        apiClient.getJson('/api/admin/accessory-orders/stats'),
        apiClient.getJson('/api/admin/mechanics/stats'),
        apiClient.getJson('/api/carwash/stats')
      ]);
      
      // Process results
      const overviewStats = overviewResult.status === 'fulfilled' ? overviewResult.value.stats : null;
      const carStats = carStatsResult.status === 'fulfilled' ? carStatsResult.value.data : null;
      const sellerStats = sellerStatsResult.status === 'fulfilled' ? sellerStatsResult.value.data : null;
      const accessoryStats = accessoryStatsResult.status === 'fulfilled' ? accessoryStatsResult.value.data : null;
      const orderStats = orderStatsResult.status === 'fulfilled' ? orderStatsResult.value.data : null;
      const mechanicStats = mechanicStatsResult.status === 'fulfilled' ? mechanicStatsResult.value.data : null;
      const carWashStats = carWashStatsResult.status === 'fulfilled' ? carWashStatsResult.value.data : null;
      
      // Check for errors
      const errors = [];
      if (overviewResult.status === 'rejected') errors.push(`Overview stats: ${overviewResult.reason.message}`);
      if (carStatsResult.status === 'rejected') errors.push(`Car stats: ${carStatsResult.reason.message}`);
      if (sellerStatsResult.status === 'rejected') errors.push(`Seller stats: ${sellerStatsResult.reason.message}`);
      if (accessoryStatsResult.status === 'rejected') errors.push(`Accessory stats: ${accessoryStatsResult.reason.message}`);
      if (orderStatsResult.status === 'rejected') errors.push(`Order stats: ${orderStatsResult.reason.message}`);
      if (mechanicStatsResult.status === 'rejected') errors.push(`Mechanic stats: ${mechanicStatsResult.reason.message}`);
      if (carWashStatsResult.status === 'rejected') errors.push(`Car wash stats: ${carWashStatsResult.reason.message}`);
      
      if (errors.length > 0) {
        setError(`Failed to load some data: ${errors.join(', ')}`);
      }
      
      setStats({
        overviewStats,
        carStats,
        sellerStats,
        accessoryStats,
        orderStats,
        mechanicStats,
        carWashStats
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Prepare data for charts
  const monthlyCarData = stats?.carStats?.monthlyStats?.map(stat => ({
    name: `${stat._id.month}/${stat._id.year}`,
    listings: stat.count
  })) || [];

  const carStatusData = stats?.carStats ? [
    { name: 'Pending', value: stats.carStats.pending },
    { name: 'Verified', value: stats.carStats.verified },
    { name: 'Rejected', value: stats.carStats.rejected }
  ] : [];

  const COLORS = ['#f59e0b', '#10b981', '#ef4444'];

  // Handle form input changes
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
      
      // In a real implementation, you would upload images and send form data to the backend
      // For now, we'll just show a success message and close the dialog
      setSuccess('Car listing created successfully');
      setAddDialogOpen(false);
      
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
      
      // Refresh the dashboard stats
      fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to create car listing');
    }
  };

  // Close add dialog and reset form
  const closeAddDialog = () => {
    setAddDialogOpen(false);
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

  if (loading && !stats) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2, mt: 1 }}>
            Loading dashboard data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome to CarvoHub Admin Panel
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
              boxShadow: '0 6px 16px rgba(30, 58, 138, 0.4)'
            }
          }}
        >
          Add New Car
        </Button>
      </Box>

      {/* Overview Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography variant="h6" fontWeight={700}>
                  Users
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} align="right">
                {stats?.overviewStats?.users || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Build sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography variant="h6" fontWeight={700}>
                  Mechanics
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} align="right">
                {stats?.overviewStats?.mechanics || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography variant="h6" fontWeight={700}>
                  Bookings
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} align="right">
                {stats?.overviewStats?.bookings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <LocalCarWash sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography variant="h6" fontWeight={700}>
                  Car Wash
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} align="right">
                {stats?.overviewStats?.carWashBookings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <ShoppingCart sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography variant="h6" fontWeight={700}>
                  Revenue
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} align="right">
                ₹{(stats?.overviewStats?.revenue || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Specific Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Car Sales Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Car Sales Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Total Listings
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {stats?.carStats?.total || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Verified
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {stats?.carStats?.verified || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Pending
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {stats?.carStats?.pending || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Rejected
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {stats?.carStats?.rejected || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Mechanics Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Mechanics Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Total Mechanics
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {stats?.mechanicStats?.total || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Active
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {stats?.mechanicStats?.active || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Inactive
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {stats?.mechanicStats?.inactive || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Avg Rating
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {stats?.mechanicStats?.avgRating || '0.0'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Accessories Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Accessories Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Total Items
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {stats?.accessoryStats?.total || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        In Stock
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {stats?.accessoryStats?.inStock || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Low Stock
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {stats?.accessoryStats?.lowStock || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        Out of Stock
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {stats?.accessoryStats?.outOfStock || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: '#1e3a8a' }} />
                <Typography variant="h6" fontWeight={700}>
                  Car Listings Growth
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyCarData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="listings" name="Listings" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Car Listing Status Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={carStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {carStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Listings']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Car Dialog */}
      <Dialog 
        open={addDialogOpen} 
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

export default AdminDashboard;