import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  MenuItem,
  Button,
  Stack,
  Snackbar,
  Alert,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Build,
  Schedule,
  Place,
  DirectionsCar,
  CalendarMonth,
  CarRepair,
  Shield,
  Star,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';

// Map UI service types to backend enum values
const serviceTypes = [
  { value: 'General Maintenance', label: 'General Service' },
  { value: 'Engine Repair', label: 'Engine Diagnostics' },
  { value: 'Brake System', label: 'Brake Service' },
  { value: 'Air Conditioning', label: 'AC Service' },
  { value: 'Battery Services', label: 'Battery Replacement' },
];

const packages = [
  {
    id: 'basic',
    title: 'Basic Care',
    price: 499,
    features: ['General inspection', 'Fluid top-up', '10-point check'],
    icon: Build,
    badge: 'Popular',
  },
  {
    id: 'standard',
    title: 'Standard Service',
    price: 999,
    features: ['Full inspection', 'Oil change', 'Brake check', '30-point check'],
    icon: CarRepair,
    highlight: true,
  },
  {
    id: 'premium',
    title: 'Premium Care',
    price: 1799,
    features: ['Full diagnostics', 'Synthetic oil', 'AC check', '50-point check'],
    icon: Star,
  },
];

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const MechanicBooking = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    serviceType: 'General Maintenance',
    preferredDate: '',
    preferredTime: '',
    address: '',
    description: '',
    packageId: 'standard',
    mechanicId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const selectedPackage = useMemo(() => packages.find((p) => p.id === form.packageId), [form.packageId]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (!form.licensePlate) throw new Error('License plate is required');
      if (!form.description) throw new Error('Please describe the issue');

      const selectedSvc = serviceTypes.find(s => s.value === form.serviceType) || serviceTypes[0];
      const pkg = packages.find(p => p.id === form.packageId) || packages[1];
      const estimatedDuration = pkg.id === 'basic' ? 1 : pkg.id === 'standard' ? 2 : 3;
      const estimatedCost = pkg.price;

      const payload = {
        serviceType: selectedSvc.value,
        vehicleInfo: {
          make: form.vehicleMake,
          model: form.vehicleModel,
          year: Number(form.vehicleYear),
          licensePlate: form.licensePlate
        },
        serviceDescription: form.description,
        scheduledDate: form.preferredDate,
        scheduledTime: form.preferredTime,
        estimatedDuration,
        estimatedCost,
        location: {
          type: form.address ? 'customer_location' : 'mechanic_shop',
          address: { street: form.address }
        },
        notes: form.description
      };

      await apiClient.postJson('/api/bookings', payload);
      setSnack({ open: true, message: 'Booking created successfully! Redirecting to your bookings...', severity: 'success' });
      setForm((prev) => ({ ...prev, description: '' }));
      setTimeout(() => navigate('/bookings'), 900);
    } catch (error) {
      setSnack({ open: true, message: 'Something went wrong. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate minimum date (today) to prevent past date selection
  const today = new Date().toISOString().split('T')[0];

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with Back Button */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <IconButton
              onClick={() => navigate('/customer')}
              sx={{
                backgroundColor: '#1E40AF',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#2563EB',
                },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>
                Book a Mechanic
              </Typography>
              <Typography variant="body1" sx={{ color: '#111827' }}>
                On-demand, reliable car service at your doorstep or our partner workshops.
              </Typography>
            </Box>
          </Stack>

          {/* Booking Details Box */}
          <MotionCard
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              maxWidth: { xs: '100%', sm: 400 },
              ml: 'auto',
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#1E40AF20',
                    color: '#1E40AF',
                  }}
                >
                  <Build />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                    Booking Details
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#111827' }}>
                    {selectedPackage ? `${selectedPackage.title} ₹${selectedPackage.price}` : ''}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MotionCard>
        </Box>

        <Grid container spacing={4}>
          {/* Left: Form */}
          <Grid item xs={12} md={8}>
            <MotionCard
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
              }}
            >
              <CardContent>
                <Box component="form" onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <DirectionsCar sx={{ color: '#1E40AF' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        Personal Information
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Full Name"
                          value={form.name}
                          onChange={handleChange('name')}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number"
                          value={form.phone}
                          onChange={handleChange('phone')}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Vehicle Information */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <DirectionsCar sx={{ color: '#1E40AF' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        Vehicle Information
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Make"
                          value={form.vehicleMake}
                          onChange={handleChange('vehicleMake')}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Model"
                          value={form.vehicleModel}
                          onChange={handleChange('vehicleModel')}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Year"
                          value={form.vehicleYear}
                          onChange={handleChange('vehicleYear')}
                          fullWidth
                          required
                          variant="outlined"
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="License Plate"
                          value={form.licensePlate}
                          onChange={handleChange('licensePlate')}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Service Information */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Build sx={{ color: '#1E40AF' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        Service Information
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Service Type"
                          value={form.serviceType}
                          onChange={handleChange('serviceType')}
                          fullWidth
                          variant="outlined"
                        >
                          {serviceTypes.map((s) => (
                            <MenuItem key={s.value} value={s.value}>
                              {s.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Schedule Information */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <CalendarMonth sx={{ color: '#1E40AF' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        Schedule Information
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="date"
                          label="Preferred Date"
                          value={form.preferredDate}
                          onChange={handleChange('preferredDate')}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: today }}
                          variant="outlined"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="time"
                          label="Preferred Time"
                          value={form.preferredTime}
                          onChange={handleChange('preferredTime')}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Service Address"
                          value={form.address}
                          onChange={handleChange('address')}
                          fullWidth
                          placeholder="Pickup location or workshop preference"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Additional Information */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <DirectionsCar sx={{ color: '#1E40AF' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        Additional Information
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          label="Describe the issue"
                          value={form.description}
                          onChange={handleChange('description')}
                          fullWidth
                          multiline
                          minRows={4}
                          placeholder="What seems to be the issue? Please provide as much detail as possible."
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      sx={{
                        backgroundColor: '#1E40AF',
                        color: 'white',
                        borderRadius: 2,
                        py: 1.5,
                        px: 4,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#2563EB',
                          boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                        },
                      }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Booking'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setForm((p) => ({ ...p, name: '', phone: '', description: '' }))}
                      sx={{
                        borderColor: '#1E40AF',
                        color: '#1E40AF',
                        borderRadius: 2,
                        py: 1.5,
                        px: 4,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#1E40AF10',
                          borderColor: '#2563EB',
                        },
                      }}
                    >
                      Clear
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Right: Packages and Info */}
          <Grid item xs={12} md={4}>
            {/* Service Packages */}
            <MotionCard
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                mb: 4,
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                    Service Packages
                  </Typography>
                }
                subheader="Choose what suits you"
                sx={{ pb: 1 }}
              />
              <CardContent>
                <Tabs
                  value={form.packageId}
                  onChange={(e, val) => setForm((p) => ({ ...p, packageId: val }))}
                  variant="fullWidth"
                  sx={{
                    mb: 3,
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#1E40AF',
                    },
                  }}
                >
                  {packages.map((p) => {
                    const Icon = p.icon;
                    return (
                      <Tab
                        key={p.id}
                        value={p.id}
                        icon={<Icon />}
                        iconPosition="start"
                        label={p.title}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          color: '#111827',
                          '&.Mui-selected': {
                            color: '#1E40AF',
                          },
                        }}
                      />
                    );
                  })}
                </Tabs>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: selectedPackage?.highlight ? '#1E40AF10' : '#f9fafb',
                    border: `1px solid ${selectedPackage?.highlight ? '#1E40AF30' : '#e5e7eb'}`,
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                        ₹{selectedPackage?.price}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#111827' }}>
                        {selectedPackage?.title}
                      </Typography>
                    </Box>

                    <Divider />

                    <Stack spacing={1.5}>
                      {selectedPackage?.features.map((f, index) => (
                        <Stack key={index} direction="row" spacing={1.5} alignItems="center">
                          <CheckCircle sx={{ color: '#1E40AF', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: '#111827' }}>
                            {f}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </CardContent>
            </MotionCard>

            {/* Why CarvoHub */}
            <MotionCard
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                    Why CarvoHub?
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Schedule sx={{ color: '#1E40AF' }} />
                    <Typography variant="body2" sx={{ color: '#111827' }}>
                      Same-day or scheduled visits
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Place sx={{ color: '#1E40AF' }} />
                    <Typography variant="body2" sx={{ color: '#111827' }}>
                      At-home service or partner workshops
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <DirectionsCar sx={{ color: '#1E40AF' }} />
                    <Typography variant="body2" sx={{ color: '#111827' }}>
                      Genuine parts and transparent pricing
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Shield sx={{ color: '#1E40AF' }} />
                    <Typography variant="body2" sx={{ color: '#111827' }}>
                      100% satisfaction guarantee
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </MotionBox>
  );
};

export default MechanicBooking;