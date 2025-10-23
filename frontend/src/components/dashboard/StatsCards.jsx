import React from 'react';
import { Grid, Card, CardContent, Stack, Typography, Box } from '@mui/material';
import { Assignment, Event, Payment, BuildCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const statItems = [
  { label: 'Total Bookings', valueKey: 'totalBookings', icon: Assignment, color: '#1E40AF' },
  { label: 'Upcoming Appointments', valueKey: 'upcoming', icon: Event, color: '#1E40AF' },
  { label: 'Pending Payments', valueKey: 'pendingPayments', icon: Payment, color: '#1E40AF' },
  { label: 'Active Requests', valueKey: 'activeRequests', icon: BuildCircle, color: '#1E40AF' },
];

const StatsCards = ({ stats = {} }) => {
  return (
    <Grid container spacing={3}>
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const value = stats[item.valueKey] ?? 0;
        return (
          <Grid key={item.label} item xs={12} sm={6} md={3}>
            <MotionCard
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              sx={{ 
                borderRadius: 3,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
              elevation={0}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`,
                    border: `1px solid ${item.color}20`,
                  }}>
                    <Icon sx={{ color: item.color, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>{value}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.label}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default StatsCards;