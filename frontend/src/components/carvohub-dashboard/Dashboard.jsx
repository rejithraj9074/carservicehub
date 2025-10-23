import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ServiceCard from './ServiceCard';
import { Build, LocalCarWash, ShoppingCart, DirectionsCar } from '@mui/icons-material';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  const userName = user?.name || 'Customer';

  const [mobileOpen, setMobileOpen] = useState(false);

  const services = [
    { title: 'Book Mechanic', icon: Build, path: '/services/mechanic' },
    { title: 'Book Car Wash', icon: LocalCarWash, path: '/services/car-wash' },
    { title: 'Buy Car Accessories', icon: ShoppingCart, path: '/store/accessories' },
    { title: 'Browse Second-Hand Cars', icon: DirectionsCar, path: '/marketplace/cars' },
  ];

  // Removed unused variables: appointments and payments

  const notifications = [
    { type: 'booking', title: 'Your mechanic is on the way', time: '2h ago', read: false },
    { type: 'payment', title: 'Invoice INV-00128 paid', time: '1d ago', read: true },
    { type: 'offer', title: '10% off on detailing', time: '3d ago', read: false },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#F9FAFB',
    }}>
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        notifications={notifications} 
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - 280px)` },
          backgroundColor: '#F9FAFB',
        }}
      >
        <Header 
          user={user} 
          notifications={notifications} 
          onDrawerToggle={handleDrawerToggle}
          onLogout={onLogout}
        />

        <Container maxWidth="lg" sx={{ py: 2 }}>
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ 
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              mb: 4,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              },
            }}>
              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                    Welcome back, {userName}!
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Manage your bookings, payments, and appointments all in one place.
                  </Typography>
                </Box>
                <Box>
                  <button
                    onClick={() => navigate('/profile')}
                    style={{
                      backgroundColor: 'white',
                      color: '#1E3A8A',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Edit Profile
                  </button>
                </Box>
              </Box>
            </Box>
          </motion.div>

          {/* Services Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#1E3A8A' }}>Services</Typography>
              <Grid container spacing={3}>
                {services.map((service, index) => (
                  <Grid item xs={12} sm={6} md={3} key={service.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <ServiceCard 
                        title={service.title} 
                        icon={service.icon} 
                        path={service.path} 
                      />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#1E3A8A' }}>Statistics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    backgroundColor: 'white', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" sx={{ color: '#1E3A8A', fontWeight: 700 }}>12</Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Active Bookings</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    backgroundColor: 'white', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" sx={{ color: '#1E3A8A', fontWeight: 700 }}>5</Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Upcoming</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    backgroundColor: 'white', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" sx={{ color: '#1E3A8A', fontWeight: 700 }}>3</Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Pending Payments</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    backgroundColor: 'white', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h4" sx={{ color: '#1E3A8A', fontWeight: 700 }}>8</Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Total Requests</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </motion.div>

          {/* Bookings and Appointments */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#1E3A8A' }}>Active Bookings</Typography>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  backgroundColor: 'white', 
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb'
                }}>
                  <Typography>No active bookings at the moment</Typography>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#1E3A8A' }}>Upcoming Appointments</Typography>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  backgroundColor: 'white', 
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb'
                }}>
                  <Typography>No upcoming appointments</Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;