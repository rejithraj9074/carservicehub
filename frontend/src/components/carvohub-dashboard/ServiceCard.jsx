import React from 'react';
import { Card, CardActionArea, CardContent, CardActions, Stack, Typography, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MotionCard = motion(Card);

const ServiceCard = ({ title, icon: Icon, path, color = '#1E3A8A' }) => {
  const navigate = useNavigate();

  return (
    <MotionCard
      whileHover={{ 
        y: -10, 
        boxShadow: '0 15px 30px rgba(30, 58, 138, 0.15)',
        scale: 1.03
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      elevation={0}
      sx={{
        borderRadius: 4,
        minWidth: 250,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e5e7eb',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
        },
      }}
    >
      <CardActionArea onClick={() => navigate(path)} sx={{ flexGrow: 1 }}>
        <CardContent sx={{ p: 3, pb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(30, 58, 138, 0.1)',
              color: '#1E3A8A',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
              <Icon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A' }}>{title}</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button 
          fullWidth 
          variant="contained" 
          endIcon={<span>→</span>}
          sx={{
            backgroundColor: '#1E3A8A',
            color: '#fff',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
            '&:hover': { 
              backgroundColor: '#3B82F6',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }} 
          onClick={() => navigate(path)}
        >
          Explore
        </Button>
      </CardActions>
    </MotionCard>
  );
};

export default ServiceCard;