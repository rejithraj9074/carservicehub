import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Menu,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu as MenuIcon } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatsCards from '../components/dashboard/StatsCards';
import ActiveBookings from '../components/dashboard/ActiveBookings';
import SimpleRescheduleModal from '../components/dashboard/SimpleRescheduleModal';
import apiClient from '../api/client';
import ServiceShortcuts from '../components/dashboard/ServiceShortcuts';
import PaymentsHistory from '../components/dashboard/PaymentsHistory';
import { logout } from '../utils/auth';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  })();
  
  const userName = user?.name || 'Customer';

  const [stats, setStats] = useState({ totalBookings: 0, upcoming: 0, pendingPayments: 0, activeRequests: 0 });
  const [activeBookings, setActiveBookings] = useState([]);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.getJson('/api/bookings?limit=50');
        const bookings = res.bookings || [];
        const active = bookings.filter(b => ['pending','confirmed','in_progress','rescheduled'].includes(b.status));
        setActiveBookings(active);
        setStats({
          totalBookings: res.pagination?.totalBookings || bookings.length,
          upcoming: active.length,
          pendingPayments: bookings.filter(b => b.payment?.status === 'pending').length,
          activeRequests: active.length
        });
      } catch (e) {
        // ignore silently for now
      }
    };
    load();
  }, []);

  const payments = [
    { service: 'Brake Replacement', amount: 150, date: 'Feb 20, 2025', method: 'Credit Card', id: 'INV-00112' },
    { service: 'Car Wash Premium', amount: 20, date: 'Feb 25, 2025', method: 'UPI', id: 'INV-00128' },
  ];

  const notifications = [
    { type: 'booking', title: 'Your mechanic is on the way', time: '2h ago', read: false },
    { type: 'payment', title: 'Invoice INV-00128 paid', time: '1d ago', read: true },
    { type: 'offer', title: '10% off on detailing', time: '3d ago', read: false },
  ];

  const isLoggedIn = Boolean(user);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout(navigate);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleReschedule = (booking) => {
    console.log('handleReschedule called with booking:', booking);
    // Simple approach - just set the booking and open state
    setSelectedBooking(booking);
    setRescheduleModalOpen(true);
  };

  const handleRescheduled = async () => {
    // Refresh bookings after rescheduling
    try {
      const res = await apiClient.getJson('/api/bookings?limit=50');
      const bookings = res.bookings || [];
      const active = bookings.filter(b => ['pending','confirmed','in_progress','rescheduled'].includes(b.status));
      setActiveBookings(active);
      
      setSnackbar({
        open: true,
        message: 'Booking rescheduled successfully!',
        severity: 'success'
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh bookings',
        severity: 'error'
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Customer Dashboard</Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Welcome!</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Please log in to view your bookings, appointments, and services.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  // For logged in users, we don't need the main navigation bar
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#F9FAFB',
    }}>
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
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
        {/* Header bar for logged in users */}
        <AppBar
          position="static"
          sx={{
            backgroundColor: '#1E3A8A',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            mb: 3,
            borderRadius: '0 0 20px 20px',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, color: 'white' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ flexGrow: 1 }} />
            
            <IconButton
              color="inherit"
              sx={{ mr: 2, color: 'white' }}
            >
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                <Bell />
              </Badge>
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ color: 'white' }}
            >
              <Avatar sx={{ bgcolor: '#3B82F6', color: 'white', width: 36, height: 36 }}>
                {userName?.[0]?.toUpperCase() || 'C'}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {userName}
              </MenuItem>
              <MenuItem onClick={handleProfile} sx={{ py: 1 }}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1, color: 'error.main' }}>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 2 }}>
          {/* Welcome Banner */}
          <Box sx={{ mb: 4 }}>
            <WelcomeBanner userName={userName} />
          </Box>
          
          {/* Stats Cards */}
          <Box sx={{ mb: 5 }}>
            <StatsCards stats={stats} />
          </Box>
          
          {/* Service Shortcuts */}
          <Box sx={{ mb: 5 }}>
            <ServiceShortcuts />
          </Box>
          
          {/* Active Bookings */}
          <Box sx={{ mb: 5 }}>
            <ActiveBookings 
              bookings={activeBookings} 
              onReschedule={handleReschedule} 
            />
          </Box>
          
          {/* Payments History */}
          <Box>
            <PaymentsHistory payments={payments} />
          </Box>
          
          {/* Reschedule Modal */}
          <SimpleRescheduleModal
            open={rescheduleModalOpen}
            onClose={() => setRescheduleModalOpen(false)}
            booking={selectedBooking}
            onRescheduled={handleRescheduled}
          />
          
          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setSnackbar({ ...snackbar, open: false })} 
              severity={snackbar.severity} 
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

export default CustomerDashboard;