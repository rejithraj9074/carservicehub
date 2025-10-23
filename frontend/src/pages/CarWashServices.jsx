import React from 'react';
import { Box, Grid, Paper, Typography, Button, Divider, List, ListItem, ListItemText, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SERVICES = [
  { name: 'Basic', price: 20, features: ['Exterior wash', 'Drying', 'Tire shine'] },
  { name: 'Premium', price: 40, features: ['Exterior wash', 'Interior vacuum', 'Dashboard clean', 'Tire shine'] },
  { name: 'Interior & Exterior', price: 55, features: ['Full exterior', 'Interior vacuum', 'Door jambs', 'Windows inside/out'] },
  { name: 'Exterior Only', price: 15, features: ['Quick exterior wash', 'Drying'] },
  { name: 'Interior Deep Clean', price: 70, features: ['Interior vacuum', 'Shampoo seats', 'Dashboard & trims', 'Odor removal'] },
];

const CarWashServices = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>Car Wash Services</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Choose a plan and proceed to booking</Typography>
      <Grid container spacing={3}>
        {SERVICES.map(svc => (
          <Grid key={svc.name} item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={800}>{svc.name}</Typography>
                <Chip color="primary" label={`₹${svc.price}`} sx={{ fontWeight: 700 }} />
              </Stack>
              <Typography variant="body2" color="text.secondary">Includes:</Typography>
              <Divider sx={{ my: 1.5 }} />
              <List dense sx={{ pt: 0 }}>
                {svc.features.map(f => (
                  <ListItem key={f} sx={{ py: 0.5 }}>
                    <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={f} />
                  </ListItem>
                ))}
              </List>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2, borderRadius: 2, py: 1.25, fontWeight: 700 }}
                onClick={() => navigate('/services/car-wash/book', { state: { serviceType: svc.name } })}
              >
                Book {svc.name}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CarWashServices;