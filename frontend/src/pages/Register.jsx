import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Slide,
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  LocalGasStation as GasIcon,
  CarRepair as RepairIcon,
  CheckCircle as CheckCircleIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import '../styles/Register.css';
import apiClient from '../api/client';
import { auth, googleProvider, signInWithPopup } from '../firebase';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Set default role to customer and hide role selection
    role: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role is fixed to 'customer', so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      };

      // For registration, always create a customer account
      const result = await apiClient.postJson('/api/auth/register', payload);

      setSuccessMessage('Account created successfully! Redirecting to login...');
      setShowSuccessSnackbar(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (error) {
      setSubmitError(error?.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Send the Firebase ID token to your backend
      const idToken = await user.getIdToken();
      
      // Send token to backend for verification and user creation/login
      // Force role to 'customer' for Google sign-ups
      const response = await fetch(`${API_BASE_URL}/api/auth/firebase/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idToken,
          role: 'customer', // Always set to customer for Google sign-ups
          phone: formData.phone // Include phone number if available
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccessMessage(`Welcome, ${data.user.name}! Redirecting to customer dashboard...`);
        setShowSuccessSnackbar(true);
        // Always redirect to customer dashboard for Google sign-ups
        setTimeout(() => {
          navigate('/customer');
        }, 1500);
      } else {
        setSubmitError(data.message || 'Failed to authenticate with Google');
      }
    } catch (error) {
      console.error('Google sign up error:', error);
      setSubmitError('Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Box className="register-container">
      {/* Left Side - Animated Service Icons */}
      <Box className="register-left-side">
        <Box className="left-hero-image">
          <img
            src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1600&auto=format&fit=crop"
            alt="Premium car care"
            loading="lazy"
          />
        </Box>
        <Box className="service-icons-container">
          <Typography className="service-title">
            CarvoHub
          </Typography>
          <Typography className="service-subtitle">
            Join our community of car enthusiasts and professionals. Get started with quality automotive services.
          </Typography>
          
          <Box className="service-icon">
            <CarIcon />
          </Box>
          <Box className="service-icon">
            <BuildIcon />
          </Box>
          <Box className="service-icon">
            <GasIcon />
          </Box>
          <Box className="service-icon">
            <RepairIcon />
          </Box>
        </Box>
      </Box>

      {/* Right Side - Register Form */}
      <Box className="register-right-side">
        <Box className="register-form-container">
          <Paper elevation={0} className="register-form">
            <Box className="register-header">
              <Box className="register-icon-container">
                <PersonAddIcon className="register-icon" />
              </Box>
              <Typography className="register-title">
                Create Account
              </Typography>
              <Typography className="register-subtitle">
                Join CarvoHub as a Customer
              </Typography>
            </Box>

            {submitError && (
              <Alert severity="error" className="alert alert-error">
                {submitError}
              </Alert>
            )}


            <form onSubmit={handleSubmit}>
              <Box className="register-form-fields">
                <Box className="form-field">
                  <label htmlFor="fullName">Full Name</label>
                  <TextField
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box className="form-field">
                  <label htmlFor="email">Email Address</label>
                  <TextField
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box className="form-field">
                  <label htmlFor="phone">Phone Number</label>
                  <TextField
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Box>

                {/* Hidden role field - always customer */}
                <input type="hidden" name="role" value="customer" />

                <Box className="form-field">
                  <label htmlFor="password">Password</label>
                  <TextField
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box className="form-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <TextField
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                className="register-button"
                disabled={Object.keys(errors).length > 0}
              >
                Create Account
              </Button>
            </form>

            <Divider sx={{ my: 2 }}>or</Divider>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              sx={{ mb: 1 }}
            >
              {isLoading ? 'Signing up with Google...' : 'Continue with Google'}
            </Button>

            <Box className="login-link">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login">
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
    {/* Premium Success Snackbar */}
    <Snackbar
      open={showSuccessSnackbar}
      autoHideDuration={2500}
      onClose={() => setShowSuccessSnackbar(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'down' }}
    >
      <Alert
        severity="success"
        icon={<CheckCircleIcon />}
        onClose={() => setShowSuccessSnackbar(false)}
        sx={{
          minWidth: '400px',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white',
            fontSize: '1.5rem',
          },
          '& .MuiAlert-message': {
            fontSize: '1rem',
            fontWeight: 600,
          },
          '& .MuiAlert-action': {
            color: 'white',
          },
        }}
      >
        {successMessage}
      </Alert>
    </Snackbar>
    </>
  );
};

export default Register;