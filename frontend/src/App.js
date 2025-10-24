import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { CssBaseline, Box, Typography, Button } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import MechanicBooking from './pages/MechanicBooking';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import MechanicLogin from './pages/MechanicLogin';
import AdminDashboard from './pages/AdminDashboard';
import MechanicDashboard from './pages/MechanicDashboard';
import MechanicOnboarding from './pages/MechanicOnboarding';
import Bookings from './pages/Bookings';
import MechanicChangePassword from './pages/MechanicChangePassword';
import CarWashServices from './pages/CarWashServices';
import CarWashBooking from './pages/CarWashBooking';

import AccessoriesStore from './pages/AccessoriesStore';
import AccessoryDetail from './pages/AccessoryDetail';
import AccessoryCheckout from './pages/AccessoryCheckout';
import AccessoryOrderStatus from './pages/AccessoryOrderStatus';
import AccessoryOrderDetail from './pages/AccessoryOrderDetail';
import Payments from './pages/Payments';
import SecondHandCars from './pages/SecondHandCars';
import CarDetails from './pages/CarDetails';
import MyInterests from './pages/MyInterests';
import TestCarListings from './pages/TestCarListings';
import SimpleCarListings from './pages/SimpleCarListings';
import DebugCarListings from './pages/DebugCarListings';
import MarketplaceCars from './pages/MarketplaceCars';

// Admin Components
import AdminLayout from './layouts/AdminLayout';
import AdminCarListings from './pages/admin/CarListings';
import AdminCarDetails from './pages/admin/CarDetails';
import AdminAddCar from './pages/admin/AddCar';
import AdminSellers from './pages/admin/Sellers';
import AdminInterestedList from './pages/admin/AdminInterestedList';
import AdminInterestedUsers from './pages/admin/AdminInterestedUsers';

// CarvoHub Dashboard Components
import TestDashboard from './components/carvohub-dashboard/TestDashboard';

import TestRescheduleModalPage from './pages/TestRescheduleModalPage';
import TestSimpleRescheduleModalPage from './pages/TestSimpleRescheduleModalPage';
import CarWashBookings from './pages/CarWashBookings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  
  // If no token, redirect to login
  if (!token) {
    return <Login />;
  }
  
  // If user role is not in allowed roles, redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'admin':
        navigate('/admin/dashboard');
        return null;
      case 'mechanic':
        navigate('/dashboard/mechanic');
        return null;
      case 'customer':
      default:
        navigate('/customer');
        return null;
    }
  }
  
  return children;
};

function App() {
  const AdminAwareLayout = () => {
    const location = useLocation();
    const isAdminDashboard = location.pathname.startsWith('/admin') && location.pathname !== '/admin/dashboard';
    const isCustomerDashboard = location.pathname === '/customer';
    
    return (
      <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: '#fafafa',
        }}>
          {/* Show navbar only if not on customer dashboard or admin dashboard */}
          {!isAdminDashboard && !isCustomerDashboard && <Navbar />}
          <Box component="main" sx={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Customer Routes */}
              <Route 
                path="/customer" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['customer', 'mechanic']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/services/mechanic" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MechanicBooking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/services/car-wash" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CarWashServices />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/services/car-wash/book" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CarWashBooking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/car-wash-bookings" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CarWashBookings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/store/accessories" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <AccessoriesStore />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/accessory-checkout" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <AccessoryCheckout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/accessory-orders" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <AccessoryOrderStatus />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/accessory-order/:id" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <AccessoryOrderDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payments" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Payments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/accessory/:id" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <AccessoryDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cars" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <SecondHandCars />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketplace/cars" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MarketplaceCars />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/simple-cars" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <SimpleCarListings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/debug-cars" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DebugCarListings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cars/:id" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CarDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-interests" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MyInterests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/test-cars" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <TestCarListings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/test-reschedule-modal" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <TestRescheduleModalPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/test-simple-reschedule-modal" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <TestSimpleRescheduleModalPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/test-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <TestDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Bookings />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminCarListings />} />
                <Route path="cars" element={<AdminCarListings />} />
                <Route path="cars/:id" element={<AdminCarDetails />} />
                <Route path="cars/add" element={<AdminAddCar />} />
                <Route path="sellers" element={<AdminSellers />} />
                <Route path="interested-cars" element={<AdminInterestedList />} />
                <Route path="interested-cars/:id" element={<AdminInterestedUsers />} />
              </Route>

              {/* Mechanic Routes */}
              <Route path="/mechanic/login" element={<MechanicLogin />} />
              <Route 
                path="/dashboard/mechanic" 
                element={
                  <ProtectedRoute allowedRoles={['mechanic']}>
                    <MechanicDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/onboarding/mechanic" 
                element={
                  <ProtectedRoute allowedRoles={['mechanic']}>
                    <MechanicOnboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mechanic/change-password" 
                element={
                  <ProtectedRoute allowedRoles={['mechanic']}>
                    <MechanicChangePassword />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route for 404 errors */}
              <Route path="*" element={
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>Page Not Found</Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    The page you're looking for doesn't exist.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => window.location.href = '/'}
                  >
                    Go Home
                  </Button>
                </Box>
              } />
            </Routes>
          </Box>
          {/* Show footer only if not on customer dashboard or admin dashboard */}
          {!isAdminDashboard && !isCustomerDashboard && <Footer />}
        </Box>
    );
  };
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <Router>
        <AdminAwareLayout />
      </Router>
    </CustomThemeProvider>
  );
}

export default App;