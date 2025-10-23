import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Snackbar, Slide } from '@mui/material';
import { Build as BuildIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const MechanicLogin = () => {
  const [mechanicId, setMechanicId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await apiClient.postJson('/api/auth/mechanic/login', { mechanicId, password });
      if (result?.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        const mustChange = result.user?.mustChangePassword;
        setSuccessMessage(`Welcome back, ${result.user.name}! Redirecting...`);
        setShowSuccessSnackbar(true);
        setTimeout(() => navigate(mustChange ? '/mechanic/change-password' : '/dashboard/mechanic'), 1500);
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
      setShowErrorSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="login-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', p: 2 }}>
      <Paper elevation={0} sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'primary.main', color: 'primary.contrastText', mb: 1 }}>
            <BuildIcon />
          </Box>
          <Typography variant="h5" fontWeight={700}>Mechanic Login</Typography>
          <Typography variant="body2" color="text.secondary">Sign in to manage your mechanic services</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Mechanic ID"
            value={mechanicId}
            onChange={(e) => setMechanicId(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'down' }}
      >
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          onClose={() => setShowSuccessSnackbar(false)}
          sx={{ minWidth: '400px', borderRadius: 3, boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)', background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'down' }}
      >
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          onClose={() => setShowErrorSnackbar(false)}
          sx={{ minWidth: '400px', borderRadius: 3, boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)', background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MechanicLogin;


