import React from 'react';
import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const AppointmentsTimeline = ({ appointments = [] }) => {
  return (
    <Card 
      sx={{ 
        borderRadius: 3, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
        }
      }} 
      elevation={2}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#1E3A8A' }}>Upcoming Appointments</Typography>
        <Stack spacing={3}>
          {appointments.map((ap, idx) => (
            <MotionBox
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Box sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                boxShadow: '0 0 0 4px rgba(28, 58, 138, 0.15)'
              }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{ap.title}</Typography>
                <Typography variant="body2" color="text.secondary">{ap.date} • {ap.time} • {ap.location}</Typography>
              </Box>
            </MotionBox>
          ))}
          {appointments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No upcoming appointments.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AppointmentsTimeline;