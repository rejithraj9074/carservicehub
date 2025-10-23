import React from 'react';
import { Avatar, Box, Button, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const WelcomeBanner = ({ userName = 'Customer', onEditProfile }) => {
  return (
    <MotionBox
      sx={{
        p: 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ position: 'relative', zIndex: 1 }}>
        <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 700, fontSize: '1.8rem', border: '2px solid rgba(255, 255, 255, 0.3)' }}>
          {userName?.[0]?.toUpperCase() || 'C'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
            Welcome back, {userName}!
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
            Manage your bookings, payments, and appointments all in one place.
          </Typography>
          <Button 
            variant="contained" 
            sx={{
              backgroundColor: 'white',
              color: '#1E3A8A',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                backgroundColor: '#F0F4FF',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.3s ease',
            }}
            onClick={onEditProfile}
          >
            Edit Profile
          </Button>
        </Box>
      </Stack>
    </MotionBox>
  );
};

export default WelcomeBanner;