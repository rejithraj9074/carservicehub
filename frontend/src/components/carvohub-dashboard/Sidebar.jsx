import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Home,
  Wrench,
  Car,
  ShoppingCart,
  CarFront,
  CreditCard,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Dashboard', icon: Home, path: '/customer' },
  { text: 'Active Mechanic Bookings', icon: Wrench, path: '/bookings' },
  { text: 'Car Wash Bookings', icon: Car, path: '/services/car-wash' },
  { text: 'Car Accessories Store', icon: ShoppingCart, path: '/store/accessories' },
  { text: 'Second-Hand Cars', icon: CarFront, path: '/marketplace/cars' },
  { text: 'Payments', icon: CreditCard, path: '/payments' },
  { text: 'Profile Settings', icon: User, path: '/profile' },
];

const MotionBox = motion(Box);

const Sidebar = ({ user, onLogout, notifications = [], mobileOpen, handleDrawerToggle }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleSidebar = () => {
    setOpen(!open);
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
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#1E3A8A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
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
                          minHeight: 48,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          py: 1.5,
                          backgroundColor: isActive ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(30, 58, 138, 0.05)',
                            transform: 'translateX(4px)',
                            transition: 'transform 0.2s ease',
                          },
                          borderRadius: '0 50px 50px 0',
                          margin: '0 10px',
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
                          <Icon size={20} />
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

            <Divider sx={{ backgroundColor: '#e5e7eb', my: 1 }} />

            <List>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <Tooltip title={!open ? 'Logout' : ''} placement="right">
                  <ListItemButton
                    onClick={handleLogout}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(30, 58, 138, 0.05)',
                        transform: 'translateX(4px)',
                        transition: 'transform 0.2s ease',
                      },
                      borderRadius: '0 50px 50px 0',
                      margin: '0 10px',
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
                      <LogOut size={20} />
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
                p: 2,
                backgroundColor: 'rgba(30, 58, 138, 0.05)',
                borderRadius: '0 0 20px 0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#1E3A8A',
                    color: 'white',
                    mr: 1.5,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E3A8A' }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
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