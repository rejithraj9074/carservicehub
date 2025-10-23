import React from 'react';
import { Grid, Card, CardActionArea, CardContent, CardActions, Stack, Typography, Box, Button } from '@mui/material';
import { Build, LocalCarWash, ShoppingCart, DirectionsCar, Receipt } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MotionCard = motion(Card);

const shortcuts = [
  { title: 'Book Mechanic', icon: Build, path: '/services/mechanic', color: '#1E3A8A' },
  { title: 'Book Car Wash', icon: LocalCarWash, path: '/services/car-wash/book', color: '#1E3A8A' }, // Changed to go directly to booking page
  { title: 'Buy Car Accessories', icon: ShoppingCart, path: '/store/accessories', color: '#1E3A8A' },
  { title: 'Track Accessory Orders', icon: Receipt, path: '/accessory-orders', color: '#1E3A8A' },
  { title: 'Browse Second-Hand Cars', icon: DirectionsCar, path: '/marketplace/cars', color: '#1E3A8A' },
];

const ServiceShortcuts = () => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      {shortcuts.map((s) => {
        const Icon = s.icon;
        return (
          <Grid key={s.title} item xs={12} sm={6} md={4}>
            <MotionCard
              whileHover={{ 
                y: -8, 
                boxShadow: '0 15px 30px rgba(30, 58, 138, 0.15)',
                scale: 1.02
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              elevation={0}
              sx={{
                borderRadius: 4,
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
              <CardActionArea onClick={() => navigate(s.path)} sx={{ flexGrow: 1 }}>
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
                      <Icon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A' }}>{s.title}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2, ml: 9 }}>
                    Access all {s.title.toLowerCase()} services
                  </Typography>
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
                    py: 1.2,
                    '&:hover': { 
                      backgroundColor: '#3B82F6',
                      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }} 
                  onClick={() => navigate(s.path)}
                >
                  Explore
                </Button>
              </CardActions>
            </MotionCard>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ServiceShortcuts;