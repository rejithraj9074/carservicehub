import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Build as BuildIcon,
  LocalCarWash as CarWashIcon,
  DirectionsCar as CarIcon,
  Settings as PartsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const services = [
    {
      title: 'Mechanic Booking',
      description: 'Book certified mechanics for your vehicle maintenance and repairs. Get instant quotes and schedule appointments.',
      icon: BuildIcon,
      action: 'Book Now',
      path: '/services/mechanic',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Car Wash Booking',
      description: 'Professional car washing services with flexible scheduling. Keep your vehicle looking its best.',
      icon: CarWashIcon,
      action: 'Book Wash',
      path: '/services/carwash',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Second-Hand Car Sales',
      description: 'Browse quality used vehicles or list your car for sale. Verified listings with detailed information.',
      icon: CarIcon,
      action: 'Browse Cars',
      path: '/login',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Car Accessories Purchase',
      description: 'Genuine car accessories for all major brands. Fast delivery and competitive pricing guaranteed.',
      icon: PartsIcon,
      action: 'Shop Accessories',
      path: '/store/accessories',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
  ];

  const handleServiceAction = (service) => {
    const isLoggedIn = (() => { try { return Boolean(localStorage.getItem('token')); } catch { return false; } })();
    if (isLoggedIn) {
      navigate(service.path);
    } else {
      navigate('/login');
    }
  };

  return (
    <Box className="home-container">
      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                className="hero-title"
              >
                Welcome to CarvoHub
              </Typography>
              <Typography
                variant="h6"
                component="p"
                paragraph
                className="hero-description"
              >
                Your comprehensive automotive service platform. From maintenance to 
                sales, we provide everything you need for your vehicle.
              </Typography>
              <Box className="hero-buttons">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => navigate('/register')}
                  className="hero-button-primary"
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => navigate('/login')}
                  className="hero-button-secondary"
                >
                  Sign In
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Intentionally left empty as per request to avoid large hero image */}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box className="services-section" id="services-section">
        <Container maxWidth="lg">
          <Box className="services-background"></Box>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            className="services-title"
          >
            Our Services
          </Typography>
          <Typography
            variant="h6"
            component="p"
            paragraph
            className="services-subtitle"
          >
            Comprehensive automotive solutions tailored to your needs
          </Typography>
          
          <Box className="services-container">
            {services.map((service, index) => (
              <Card key={index} className="service-card">
                <CardMedia
                  component="img"
                  image={service.image}
                  alt={service.title}
                  className="service-media"
                  loading="lazy"
                />
                <Box className="service-icon">
                  <service.icon />
                </Box>
                <CardContent sx={{ padding: 0 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    className="service-title"
                  >
                    {service.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="service-description"
                  >
                    {service.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ padding: 0, marginTop: 'auto' }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleServiceAction(service)}
                    className="service-button"
                    fullWidth
                  >
                    {service.action}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className="features-section">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            className="features-title"
          >
            Why Choose CarvoHub?
          </Typography>
          <Typography
            variant="h6"
            component="p"
            paragraph
            className="features-subtitle"
          >
            Professional service with a commitment to quality and customer satisfaction
          </Typography>
          
          <Grid container spacing={4} className="features-grid">
            <Grid item xs={12} md={4}>
              <Box className="feature-card">
                <Box className="feature-icon">
                  <BuildIcon />
                </Box>
                <Typography variant="h6" component="h3" className="feature-title">
                  Expert Mechanics
                </Typography>
                <Typography variant="body2" className="feature-description">
                  Certified professionals with years of experience in automotive repair and maintenance.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className="feature-card">
                <Box className="feature-icon">
                  <CarWashIcon />
                </Box>
                <Typography variant="h6" component="h3" className="feature-title">
                  Quality Service
                </Typography>
                <Typography variant="body2" className="feature-description">
                  Premium materials and equipment ensure your vehicle receives the best care possible.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className="feature-card">
                <Box className="feature-icon">
                  <CarIcon />
                </Box>
                <Typography variant="h6" component="h3" className="feature-title">
                  Convenient Booking
                </Typography>
                <Typography variant="body2" className="feature-description">
                  Easy online booking system with flexible scheduling to fit your busy lifestyle.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
