import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Collapse,
} from '@mui/material';
import Home from 'lucide-react/dist/esm/icons/home';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import Car from 'lucide-react/dist/esm/icons/car';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import CarFront from 'lucide-react/dist/esm/icons/car-front';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import User from 'lucide-react/dist/esm/icons/user';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Package from 'lucide-react/dist/esm/icons/package';
import Receipt from 'lucide-react/dist/esm/icons/receipt';
import ChevronsUpDown from 'lucide-react/dist/esm/icons/chevrons-up-down';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Truck from 'lucide-react/dist/esm/icons/truck';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../api/client';

const menuItems = [
  { text: 'Dashboard', icon: Home, path: '/customer' },
  { text: 'Active Mechanic Bookings', icon: Wrench, path: '/bookings' },
  { text: 'Active Car Wash Bookings', icon: Car, path: '/car-wash-bookings' },
  { text: 'Car Accessories Store', icon: ShoppingCart, path: '/store/accessories' },
  { text: 'My Accessory Orders', icon: Package, path: '/accessory-orders' },
  { text: 'Second-Hand Cars', icon: CarFront, path: '/marketplace/cars' },
  { text: 'Payments', icon: CreditCard, path: '/payments' },
  { text: 'Profile Settings', icon: User, path: '/profile' },
];

const MotionBox = motion(Box);

const Sidebar = ({ user, onLogout, notifications = [], mobileOpen, handleDrawerToggle }) => {
  const [open, setOpen] = useState(true);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const toggleOrders = () => {
    setOrdersOpen(!ordersOpen);
    // Fetch orders when expanding
    if (!ordersOpen && recentOrders.length === 0) {
      fetchRecentOrders();
    }
  };

  const fetchRecentOrders = async () => {
    if (loadingOrders) return;
    
    setLoadingOrders(true);
    try {
      const response = await apiClient.getJson('/api/accessory-orders/user');
      // Get only the 3 most recent orders
      const orders = (response.data || []).slice(0, 3);
      setRecentOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setRecentOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock size={16} />;
      case 'Processing':
        return <Clock size={16} />;
      case 'Shipped':
        return <Truck size={16} />;
      case 'Delivered':
        return <CheckCircle size={16} />;
      case 'Cancelled':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Shipped':
        return 'primary';
      case 'Delivered':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <AnimatePresence>
        <MotionBox
          component={Drawer}
          variant={isMobile ? 'temporary' : 'permanent'}
          anchor="left"
          open={open || isMobile ? mobileOpen !== undefined ? mobileOpen : open : open}
          onClose={handleDrawerToggle}
          sx={{
            width: open ? 280 : 80,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: open ? 280 : 80,
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              color: '#1E3A8A',
              borderRight: '1px solid #e5e7eb',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              borderRadius: '0 20px 20px 0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              mt: 1,
              height: 'calc(100vh - 16px)',
            },
          }}
          initial={false}
          animate={{ width: open ? 280 : 80 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: open ? 'space-between' : 'center',
              padding: open ? theme.spacing(0, 1) : theme.spacing(0),
              height: 64,
              backgroundColor: 'transparent',
            }}
          >
            <AnimatePresence>
              {open && (
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      fontWeight: 700,
                      color: '#1E3A8A',
                      ml: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#1E3A8A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                      }}
                    >
                      CH
                    </Box>
                    CarvoHub
                  </Typography>
                </MotionBox>
              )}
            </AnimatePresence>
            <IconButton
              onClick={toggleSidebar}
              sx={{
                color: '#1E3A8A',
                mr: open ? 1 : 0,
              }}
            >
              {open ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </IconButton>
          </Box>

          <Divider sx={{ backgroundColor: '#e5e7eb' }} />

          <Box sx={{ overflow: 'auto', py: 2 }}>
            <List>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                    <Tooltip title={!open ? item.text : ''} placement="right">
                      <ListItemButton
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                          minHeight: 52,
                          justifyContent: open ? 'initial' : 'center',
                          px: 3,
                          py: 1.5,
                          backgroundColor: isActive ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(30, 58, 138, 0.05)',
                            transform: 'translateX(4px)',
                            transition: 'transform 0.2s ease',
                          },
                          borderRadius: '0 50px 50px 0',
                          margin: '0 12px',
                          mb: 0.5,
                          position: 'relative',
                          '&::before': {
                            content: isActive ? '""' : 'none',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            background: 'linear-gradient(to bottom, #1E3A8A, #3B82F6)',
                            borderRadius: '0 4px 4px 0',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color: isActive ? '#1E3A8A' : '#64748B',
                          }}
                        >
                          <Icon size={22} />
                        </ListItemIcon>
                        <AnimatePresence>
                          {open && (
                            <MotionBox
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ListItemText
                                primary={item.text}
                                sx={{
                                  color: isActive ? '#1E3A8A' : '#64748B',
                                  '& .MuiListItemText-primary': {
                                    fontWeight: isActive ? 600 : 400,
                                  },
                                }}
                              />
                            </MotionBox>
                          )}
                        </AnimatePresence>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ backgroundColor: '#e5e7eb', my: 2 }} />

            {/* Order Tracking Section */}
            <AnimatePresence>
              {open && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  sx={{ px: 2, mb: 2 }}
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: -12, 
                        right: -12, 
                        width: 70, 
                        height: 70, 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                      }} 
                    />
                    
                    <Box sx={{ position: 'relative', p: 2.5 }}>
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Box sx={{ 
                          width: 44, 
                          height: 44, 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1.5
                        }}>
                          <Receipt size={22} />
                        </Box>
                        
                        <IconButton 
                          size="small" 
                          onClick={toggleOrders}
                          sx={{ color: 'white' }}
                        >
                          {ordersOpen ? <ChevronsUpDown size={20} /> : <ChevronsUpDown size={20} />}
                        </IconButton>
                      </Box>
                      
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Track Orders
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, display: 'block' }}>
                        View status of your accessory purchases
                      </Typography>
                      
                      <Button 
                        variant="contained" 
                        size="medium"
                        fullWidth
                        sx={{ 
                          backgroundColor: 'white', 
                          color: '#1E3A8A',
                          fontWeight: 600,
                          py: 1.2,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          '&:hover': {
                            backgroundColor: '#f0f0f0',
                          },
                          transition: 'all 0.3s ease',
                          borderRadius: 2,
                        }}
                        onClick={() => handleNavigation('/accessory-orders')}
                      >
                        View All Orders
                      </Button>
                      
                      <Collapse in={ordersOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 2.5 }}>
                          {loadingOrders ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                              <CircularProgress size={22} sx={{ color: 'white' }} />
                            </Box>
                          ) : recentOrders.length === 0 ? (
                            <Typography variant="body2" sx={{ opacity: 0.8, fontStyle: 'italic', textAlign: 'center' }}>
                              No recent orders
                            </Typography>
                          ) : (
                            <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
                              {recentOrders.map((order) => (
                                <Box 
                                  key={order._id} 
                                  sx={{ 
                                    p: 1.8, 
                                    mb: 1.5, 
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    }
                                  }}
                                  onClick={() => handleNavigation(`/accessory-order/${order._id}`)}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                      {order.orderNumber}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {getStatusIcon(order.status)}
                                      <Chip
                                        label={order.status}
                                        size="small"
                                        color={getStatusColor(order.status)}
                                        sx={{ 
                                          height: 22, 
                                          '& .MuiChip-label': { 
                                            px: 0.8,
                                            fontSize: '0.7rem'
                                          },
                                          '& .MuiChip-icon': {
                                            fontSize: '0.8rem'
                                          }
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    ₹{order.totalAmount?.toFixed(2)} • {new Date(order.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  </Paper>
                </MotionBox>
              )}
            </AnimatePresence>

            <List>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <Tooltip title={!open ? 'Logout' : ''} placement="right">
                  <ListItemButton
                    onClick={handleLogout}
                    sx={{
                      minHeight: 52,
                      justifyContent: open ? 'initial' : 'center',
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(30, 58, 138, 0.05)',
                        transform: 'translateX(4px)',
                        transition: 'transform 0.2s ease',
                      },
                      borderRadius: '0 50px 50px 0',
                      margin: '0 12px',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: '#64748B',
                      }}
                    >
                      <LogOut size={22} />
                    </ListItemIcon>
                    <AnimatePresence>
                      {open && (
                        <MotionBox
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ListItemText
                            primary="Logout"
                            sx={{ color: '#64748B' }}
                          />
                        </MotionBox>
                      )}
                    </AnimatePresence>
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </List>
          </Box>

          {open && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                p: 2.5,
                backgroundColor: 'rgba(30, 58, 138, 0.05)',
                borderRadius: '0 0 20px 0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: '#1E3A8A',
                    color: 'white',
                    mr: 2,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E3A8A' }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Customer
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </MotionBox>
      </AnimatePresence>
    </>
  );
};

export default Sidebar;