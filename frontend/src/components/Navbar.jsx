import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import { Menu as MenuIcon, DirectionsCar as CarIcon, AccountCircle as AccountIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleServicesClick = () => {
    if (location.pathname === '/') {
      // If we're on the home page, scroll to services section
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on another page, navigate to home and then scroll
      navigate('/');
      setTimeout(() => {
        const servicesSection = document.getElementById('services-section');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isLoggedIn = (() => {
    try { return Boolean(localStorage.getItem('token')); } catch { return false; }
  })();

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    navigate('/login');
    if (isMobile) setMobileOpen(false);
  };

  const navItems = isLoggedIn
    ? [
        { text: 'Home', path: '/' },
        { text: 'Services', action: handleServicesClick, isAction: true },
        { text: 'Cars', path: '/cars' },
      ]
    : [
        { text: 'Home', path: '/' },
        { text: 'Services', action: handleServicesClick, isAction: true },
        { text: 'Login', path: '/login' },
        { text: 'Register', path: '/register' },
      ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', height: '100%', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
      <Typography variant="h6" sx={{ my: 3, color: 'white', fontWeight: 700 }}>
        <CarIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.5rem' }} />
        CarvoHub
      </Typography>
      <List>
        {isLoggedIn ? (
          <>
            {navItems.map((item) => (
              <ListItem 
                key={item.text} 
                onClick={item.isAction ? item.action : () => handleNavigation(item.path)}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiTypography-root': {
                      fontWeight: isActive(item.path) ? 700 : 600,
                    },
                  }}
                />
              </ListItem>
            ))}
            <ListItem sx={{ justifyContent: 'center' }}>
              <Button
                onClick={() => handleNavigation('/profile')}
                startIcon={<AccountIcon />}
                sx={{ color: 'white', fontWeight: 700 }}
              >
                Profile
              </Button>
            </ListItem>
            <ListItem sx={{ justifyContent: 'center' }}>
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ color: 'white', fontWeight: 700 }}
              >
                Logout
              </Button>
            </ListItem>
          </>
        ) : (
          navItems.map((item) => (
            <ListItem 
              key={item.text} 
              onClick={item.isAction ? item.action : () => handleNavigation(item.path)}
              sx={{
                mx: 2,
                borderRadius: 2,
                mb: 1,
                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateX(8px)',
                },
              }}
            >
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiTypography-root': {
                    fontWeight: isActive(item.path) ? 700 : 600,
                  },
                }}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          top: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        elevation={0}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0, md: 0 } }}>
            <Typography
              variant="h5"
              component="div"
              sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 800,
                background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => handleNavigation('/')}
            >
              <CarIcon sx={{ mr: 1.5, fontSize: '2rem', color: 'white' }} />
              CarvoHub
            </Typography>
            
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {isLoggedIn ? (
                  <>
                    {navItems.map((item) => (
                      <Button
                        key={item.text}
                        color="inherit"
                        onClick={item.isAction ? item.action : () => handleNavigation(item.path)}
                        sx={{
                          backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 3,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          border: isActive(item.path) ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid transparent',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                          },
                        }}
                      >
                        {item.text}
                      </Button>
                    ))}
                    <Button
                      color="inherit"
                      onClick={() => handleNavigation('/profile')}
                      startIcon={<AccountIcon />}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Profile
                    </Button>
                    <Button
                      color="inherit"
                      onClick={handleLogout}
                      startIcon={<LogoutIcon />}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  navItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      onClick={item.isAction ? item.action : () => handleNavigation(item.path)}
                      sx={{
                        backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        border: isActive(item.path) ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  ))
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;