import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Snackbar, Slide } from '@mui/material';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';

const MechanicChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    try {
      await apiClient.putJson('/api/auth/mechanic/change-password', { newPassword: password });
      setSuccess('Password changed successfully');
      setShowSuccess(true);
      setTimeout(()=>navigate('/dashboard/mechanic'), 1200);
    } catch (e) {
      setError(e?.message || 'Failed to change password');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', p: 2 }}>
      <Paper elevation={0} sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Set a new password</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={onSubmit}>
          <TextField label="New Password" type="password" fullWidth size="small" sx={{ mb: 2 }} value={password} onChange={e=>setPassword(e.target.value)} />
          <TextField label="Confirm Password" type="password" fullWidth size="small" sx={{ mb: 2 }} value={confirm} onChange={e=>setConfirm(e.target.value)} />
          <Button type="submit" variant="contained" fullWidth>Save</Button>
        </form>
      </Paper>

      <Snackbar open={showSuccess} autoHideDuration={2500} onClose={()=>setShowSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} TransitionComponent={Slide} TransitionProps={{ direction: 'down' }}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MechanicChangePassword;


