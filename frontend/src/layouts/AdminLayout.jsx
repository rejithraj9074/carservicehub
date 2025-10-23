import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/admin/Navbar';
import Sidebar from '../components/admin/Sidebar';
import Footer from '../components/admin/Footer';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    // Check for adminToken (from AdminLogin) or token with admin role (from general Login)
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // If we have adminToken, use it
    if (adminToken) {
      // In a real app, you would fetch user details from the backend
      // For now, we'll use mock data
      setUser({
        name: 'Admin User',
        email: 'admin@carvohub.com',
        role: 'admin'
      });
      return;
    }
    
    // If we have a regular token, check if it's for an admin
    if (token && userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.role === 'admin') {
          setUser(userObj);
          return;
        }
      } catch (e) {
        // Invalid user data
      }
    }
    
    // If no valid admin authentication, redirect to admin login
    navigate('/admin/login');
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // Remove both possible token types
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/admin/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        toggleSidebar={toggleSidebar} 
      />
      <Sidebar 
        open={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        user={user} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? 280 : 80}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* This pushes content below the navbar */}
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default AdminLayout;