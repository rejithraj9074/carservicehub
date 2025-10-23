import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';

const Footer = () => {
  const socialMedia = [
    { icon: Facebook, url: 'https://facebook.com/carvohub', color: '#1877f2' },
    { icon: Twitter, url: 'https://twitter.com/carvohub', color: '#1da1f2' },
    { icon: Instagram, url: 'https://instagram.com/carvohub', color: '#e1306c' },
    { icon: LinkedIn, url: 'https://linkedin.com/company/carvohub', color: '#0a66c2' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1e3a8a',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              CarvoHub
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)" paragraph>
              Your trusted platform for second-hand car sales, automotive services, 
              and accessories. Connecting buyers and sellers with ease.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)" paragraph>
              Email: support@carvohub.com
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)" paragraph>
              Phone: +91 98765 43210
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)" paragraph>
              Address: 123 Auto Street, Car City, CC 12345
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {socialMedia.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    backgroundColor: `${social.color}20`,
                    color: social.color,
                    '&:hover': {
                      backgroundColor: `${social.color}30`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 8px ${social.color}40`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <social.icon />
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 4, pt: 3 }}>
          <Typography variant="body2" color="rgba(255,255,255,0.7)" align="center">
            © {new Date().getFullYear()} CarvoHub. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;