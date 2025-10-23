import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Chip, MenuItem, Snackbar, Alert, Slide } from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const SPECIALIZATIONS = [
  'Engine Repair','Brake System','Transmission','Electrical Systems','Air Conditioning','Suspension','Exhaust System','General Maintenance','Diagnostic Services','Oil Change','Tire Services','Battery Services'
];

const MechanicOnboarding = () => {
  const [specialization, setSpecialization] = useState([]);
  const [experience, setExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!user?.id) {
      setError('Please log in first.');
      return;
    }
    try {
      await apiClient.postJson('/api/mechanics', {
        userId: user.id,
        specialization,
        experience: Number(experience),
        hourlyRate: Number(hourlyRate),
        serviceArea: serviceArea.split(',').map((s) => s.trim()).filter(Boolean),
        bio
      });
      setSuccess('Mechanic profile created! Redirecting...');
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard/mechanic'), 1200);
    } catch (e) {
      setError(e?.message || 'Failed to create mechanic profile');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <Paper elevation={0} sx={{ p: 3, maxWidth: 640, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BuildIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>Mechanic Onboarding</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Provide your professional details to activate your mechanic profile.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            select
            SelectProps={{ multiple: true, renderValue: (selected) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selected.map((value) => (<Chip key={value} label={value} size="small"/>))}
              </Box>
            )}}
            fullWidth
            size="small"
            label="Specializations"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            sx={{ mb: 2 }}
            required
          >
            {SPECIALIZATIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField label="Years of experience" type="number" size="small" fullWidth sx={{ mb: 2 }} value={experience} onChange={(e)=>setExperience(e.target.value)} required />
          <TextField label="Hourly rate" type="number" size="small" fullWidth sx={{ mb: 2 }} value={hourlyRate} onChange={(e)=>setHourlyRate(e.target.value)} required />
          <TextField label="Service areas (comma separated)" size="small" fullWidth sx={{ mb: 2 }} value={serviceArea} onChange={(e)=>setServiceArea(e.target.value)} required />
          <TextField label="Short bio (optional)" size="small" fullWidth multiline minRows={3} sx={{ mb: 2 }} value={bio} onChange={(e)=>setBio(e.target.value)} />
          <Button type="submit" variant="contained">Create Profile</Button>
        </form>
      </Paper>

      <Snackbar open={showSuccess} autoHideDuration={2500} onClose={()=>setShowSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} TransitionComponent={Slide} TransitionProps={{ direction: 'down' }}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MechanicOnboarding;


