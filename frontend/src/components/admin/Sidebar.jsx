import React from 'react';
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
  Tooltip,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import {
  Home,
  DirectionsCar,
  People,
  ChevronLeft,
  ChevronRight,
  Favorite
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Dashboard', icon: Home, path: '/admin/dashboard' },
  { text: 'Car Listings', icon: DirectionsCar, path: '/admin/cars' },
  { text: 'Interested Cars', icon: Favorite, path: '/admin/interested-cars' },
  { text: 'Sellers', icon: People, path: '/admin/sellers' },
];

const MotionBox = motion(Box);

const Sidebar = ({ open, toggleSidebar, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <>
      <AnimatePresence>
        <MotionBox
          component={Drawer}
          variant={isMobile ? 'temporary' : 'permanent'}
          anchor="left"
          open={open || isMobile}
          onClose={() => open && toggleSidebar()}
          sx={{
            width: open ? 280 : 80,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: open ? 280 : 80,
              boxSizing: 'border-box',
              backgroundColor: '#1e40af',
              color: 'white',
              borderRight: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
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
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                      color: 'white',
                      ml: 2,
                    }}
                  >
                    Admin Panel
                  </Typography>
                </MotionBox>
              )}
            </AnimatePresence>
            <IconButton
              onClick={toggleSidebar}
              sx={{
                color: 'white',
                mr: open ? 1 : 0,
              }}
            >
              {open ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </IconButton>
          </Box>

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

          <Box sx={{ overflow: 'auto', py: 2 }}>
            <List>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                                (item.path === '/admin/dashboard' && location.pathname === '/admin') ||
                                (item.path === '/admin/interested-cars' && location.pathname.startsWith('/admin/interested-cars'));
                
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
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                            color: 'white',
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
                                  color: 'white',
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
          </Box>

          {open && user && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                p: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#2563EB',
                    color: 'white',
                    mr: 1.5,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                    {user?.name || 'Admin'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Administrator
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