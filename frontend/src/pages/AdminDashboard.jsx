import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Divider, 
  TextField, 
  MenuItem, 
  Button, 
  Snackbar, 
  Alert, 
  Slide, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton, 
  ListItemIcon,
  Select, 
  InputLabel, 
  FormControl,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Build as BuildIcon, 
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  LocalCarWash as CarWashIcon,
  Inventory as InventoryIcon,
  DirectionsCar as CarSalesIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Favorite as FavoriteIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import AccessoriesManagement from '../components/AccessoriesManagement';
import AccessoryOrdersManagement from '../components/AccessoryOrdersManagement';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const CarListingsEmbedded = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    brand: ''
  });

  // Fetch car listings
  const fetchCarListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '5', // Show only 5 listings in the dashboard
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.brand && { brand: filters.brand })
      });

      const response = await apiClient.getJson(`/api/admin/cars?${params}`);
      setCars(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch car listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarListings();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Verified':
        return <Chip icon={<CheckCircleIcon />} label="Verified" color="success" size="small" />;
      case 'Rejected':
        return <Chip icon={<CancelIcon />} label="Rejected" color="error" size="small" />;
      case 'Pending':
      default:
        return <Chip icon={<ScheduleIcon />} label="Pending" color="warning" size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search cars..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Verified">Verified</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/cars')}
          >
            View All Listings
          </Button>
        </Box>

        {/* Car Listings Table */}
        {cars.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No car listings found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Brand/Model</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {car.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{car.brand} {car.model}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{car.year}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        ₹{car.price?.toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(car.status)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => navigate(`/admin/cars/${car._id}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

const StatCard = ({ icon: Icon, label, value, color, onClick, trend, trendValue }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
            : '0 12px 40px rgba(0, 0, 0, 0.15)',
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            width: 56, 
            height: 56, 
            borderRadius: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            bgcolor: color, 
            color: '#fff',
            boxShadow: `0 8px 32px ${color}40`
          }}>
            <Icon sx={{ fontSize: 28 }} />
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: trend === 'up' ? '#10b981' : '#ef4444' }} />
              <Typography variant="caption" color={trend === 'up' ? 'success.main' : 'error.main'}>
                {trendValue}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [carWashBookings, setCarWashBookings] = useState([]); // New state for car wash bookings
  const [mechanics, setMechanics] = useState([]);
  const [users, setUsers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  // const [assigning, setAssigning] = useState(false); // Unused for now
  const [mechFormOpen, setMechFormOpen] = useState(false);
  const [mechForm, setMechForm] = useState({
    id: '', name: '', email: '', phone: '', password: '', 
    specialization: [], experience: '', hourlyRate: '', 
    serviceArea: [], bio: ''
  });
  const [mechLoading, setMechLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const SPECIALIZATIONS = [
    'Engine Repair', 'Brake System', 'Transmission', 'Electrical Systems',
    'Air Conditioning', 'Suspension', 'Exhaust System', 'General Maintenance',
    'Diagnostic Services', 'Oil Change', 'Tire Services', 'Battery Services'
  ];

  const menuItems = [
    { key: 'overview', label: 'Overview', icon: DashboardIcon },
    { key: 'users', label: 'Users', icon: PersonIcon },
    { key: 'bookings', label: 'Bookings', icon: AssignmentIcon },
    { key: 'mechanic_mgmt', label: 'Mechanic Management', icon: BuildIcon },
    { key: 'carwash_mgmt', label: 'Car Wash Management', icon: CarWashIcon },
    { key: 'accessories_inventory', label: 'Car Accessories Inventory', icon: InventoryIcon },
    { key: 'accessory_orders', label: 'Accessory Orders', icon: AssignmentIcon },
    { key: 'cars_sales', label: '2nd-hand Car Sales', icon: CarSalesIcon },
    { key: 'interested_cars', label: 'Interested Cars', icon: FavoriteIcon },
    { key: 'reports', label: 'Reports', icon: BarChartIcon }
  ];

  // Mock data for charts and additional metrics
  const monthlyBookingsData = [
    { month: 'Jan', bookings: 45 },
    { month: 'Feb', bookings: 52 },
    { month: 'Mar', bookings: 48 },
    { month: 'Apr', bookings: 61 },
    { month: 'May', bookings: 55 },
    { month: 'Jun', bookings: 67 },
    { month: 'Jul', bookings: 72 },
    { month: 'Aug', bookings: 68 },
    { month: 'Sep', bookings: 75 },
    { month: 'Oct', bookings: 82 },
    { month: 'Nov', bookings: 78 },
    { month: 'Dec', bookings: 85 }
  ];

  const serviceTypeData = [
    { name: 'Engine Repair', value: 35, color: '#1e3a8a' },
    { name: 'Brake Service', value: 25, color: '#1e40af' },
    { name: 'Oil Change', value: 20, color: '#2563eb' },
    { name: 'Car Wash', value: 15, color: '#3b82f6' },
    { name: 'Other', value: 5, color: '#6b7280' }
  ];

  const notifications = [
    { id: 1, message: 'New booking request from John Doe', time: '2 min ago', type: 'booking' },
    { id: 2, message: 'Mechanic availability updated', time: '15 min ago', type: 'mechanic' },
    { id: 3, message: 'Car wash service completed', time: '1 hour ago', type: 'carwash' }
  ];

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [overview, bookingsRes, carWashBookingsRes, mechanicsRes, usersRes] = await Promise.all([
          apiClient.getJson('/api/admin/overview'),
          apiClient.getJson('/api/bookings?limit=50'),
          apiClient.getJson('/api/carwash?limit=100'),
          apiClient.getJson('/api/mechanics'),
          apiClient.getJson('/api/admin/users')
        ]);
        setStats(overview.stats);
        setBookings(bookingsRes.bookings || []);
        setCarWashBookings(carWashBookingsRes.bookings || []);
        const mechList = (mechanicsRes && Array.isArray(mechanicsRes.mechanics))
          ? mechanicsRes.mechanics
          : (Array.isArray(mechanicsRes) ? mechanicsRes : (mechanicsRes?.mechanics?.mechanics || []));
        setMechanics(mechList);
        setUsers(usersRes.users || []);
        setStaffList(usersRes.users || []);
      } catch (e) {
        setError(e?.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Refresh car wash bookings when car wash management section is active
  useEffect(() => {
    const loadCarWashBookings = async () => {
      if (activeSection === 'carwash_mgmt') {
        try {
          const res = await apiClient.getJson('/api/carwash?limit=100');
          setCarWashBookings(res.bookings || []);
        } catch (e) {
          setToast({ open: true, type: 'error', message: e?.message || 'Failed to load car wash bookings' });
        }
      }
    };
    loadCarWashBookings();
  }, [activeSection]);

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    logout(navigate);
    handleProfileMenuClose();
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Refresh overview stats
  const refreshOverviewStats = async () => {
    try {
      const res = await apiClient.getJson('/api/admin/overview');
      setStats(res.stats);
    } catch (e) {
      setToast({ open: true, type: 'error', message: e?.message || 'Failed to refresh stats' });
    }
  };

  // Refresh car wash bookings
  const refreshCarWashBookings = async () => {
    try {
      const res = await apiClient.getJson('/api/carwash?limit=100');
      setCarWashBookings(res.bookings || []);
    } catch (e) {
      setToast({ open: true, type: 'error', message: e?.message || 'Failed to load car wash bookings' });
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    try {
      const [overview, bookingsRes, carWashBookingsRes, mechanicsRes, usersRes] = await Promise.all([
        apiClient.getJson('/api/admin/overview'),
        apiClient.getJson('/api/bookings?limit=50'),
        apiClient.getJson('/api/carwash?limit=100'),
        apiClient.getJson('/api/mechanics'),
        apiClient.getJson('/api/admin/users')
      ]);
      setStats(overview.stats);
      setBookings(bookingsRes.bookings || []);
      setCarWashBookings(carWashBookingsRes.bookings || []);
      const mechList = (mechanicsRes && Array.isArray(mechanicsRes.mechanics))
        ? mechanicsRes.mechanics
        : (Array.isArray(mechanicsRes) ? mechanicsRes : (mechanicsRes?.mechanics?.mechanics || []));
      setMechanics(mechList);
      setUsers(usersRes.users || []);
      setStaffList(usersRes.users || []);
      setToast({ open: true, type: 'success', message: 'Data refreshed successfully' });
    } catch (e) {
      setToast({ open: true, type: 'error', message: e?.message || 'Failed to refresh data' });
    }
  };

  // Refresh data when sections become active
  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeSection === 'carwash_mgmt') {
          const res = await apiClient.getJson('/api/carwash?limit=100');
          setCarWashBookings(res.bookings || []);
        } else if (activeSection === 'overview') {
          // Refresh overview stats
          const res = await apiClient.getJson('/api/admin/overview');
          setStats(res.stats);
        }
      } catch (e) {
        setToast({ open: true, type: 'error', message: e?.message || `Failed to load ${activeSection} data` });
      }
    };
    loadData();
  }, [activeSection]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Make sure you are logged in as an admin.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer 
        variant={isMobile ? 'temporary' : 'persistent'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarOpen ? 280 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            CarvoHub
          </Typography>
          {!isMobile && (
            <IconButton onClick={handleSidebarToggle} size="small">
              {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          )}
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={activeSection === item.key}
                onClick={() => setActiveSection(item.key)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleSidebarToggle}
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'text.primary' }}>
              Admin Dashboard
            </Typography>

            {/* Search Bar */}
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ 
                mr: 2, 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            />

            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleDarkMode} sx={{ mr: 1 }}>
                {darkMode ? '☀️' : '🌙'}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton onClick={handleNotificationMenuOpen} sx={{ mr: 1 }}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationMenuClose}
              PaperProps={{
                sx: { width: 320, maxHeight: 400 }
              }}
            >
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6">Notifications</Typography>
              </Box>
              {notifications.map((notification) => (
                <MenuItem key={notification.id} onClick={handleNotificationMenuClose}>
                  <Box>
                    <Typography variant="body2">{notification.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>

            {/* Profile */}
            <Tooltip title="Profile">
              <IconButton onClick={handleProfileMenuOpen}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <SettingsIcon sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <HelpIcon sx={{ mr: 1 }} />
                Help
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Dashboard Content */}
        <Box sx={{ p: { xs: 2, md: 4 }, flex: 1 }}>
          {activeSection === 'overview' && (
            <Box>
              {/* Enhanced Metric Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={PeopleIcon} 
                    label="Total Users" 
                    value={stats?.users ?? 0} 
                    color="#1e3a8a"
                    trend="up"
                    trendValue="12"
                    onClick={() => setActiveSection('users')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={BuildIcon} 
                    label="Total Mechanics" 
                    value={stats?.mechanics ?? 0} 
                    color="#1e40af"
                    trend="up"
                    trendValue="8"
                    onClick={() => setActiveSection('mechanic_mgmt')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={AssignmentIcon} 
                    label="Total Bookings" 
                    value={stats?.bookings ?? 0} 
                    color="#2563eb"
                    trend="up"
                    trendValue="15"
                    onClick={() => setActiveSection('bookings')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={CarWashIcon} 
                    label="Active Car Wash" 
                    value={stats?.carWashBookings ?? 0} 
                    color="#3b82f6"
                    trend="up"
                    trendValue="5"
                    onClick={() => setActiveSection('carwash_mgmt')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={InventoryIcon} 
                    label="Spare Parts Stock" 
                    value="1,247" 
                    color="#1e40af"
                    trend="down"
                    trendValue="3"
                    onClick={() => setActiveSection('spares_inventory')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={WarningIcon} 
                    label="Pending Requests" 
                    value="18" 
                    color="#3b82f6"
                    trend="up"
                    trendValue="22"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={MoneyIcon} 
                    label="Revenue (Monthly)" 
                    value={`₹${(stats?.revenue || 0).toLocaleString('en-IN')}`} 
                    color="#1e3a8a"
                    trend="up"
                    trendValue="18"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={InventoryIcon} 
                    label="Accessories" 
                    value="156" 
                    color="#2563eb"
                    trend="up"
                    trendValue="8"
                    onClick={() => setActiveSection('accessories_inventory')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={CarSalesIcon} 
                    label="Cars for Sale" 
                    value="8" 
                    color="#3b82f6"
                    onClick={() => setActiveSection('cars_sales')}
                  />
                </Grid>
              </Grid>

              {/* Charts Section */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Monthly Bookings Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyBookingsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                          <YAxis stroke={theme.palette.text.secondary} />
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="bookings" 
                            stroke="#1e3a8a" 
                            strokeWidth={3}
                            dot={{ fill: '#1e3a8a', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#1e3a8a', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Service Type Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={serviceTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {serviceTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box sx={{ mt: 2 }}>
                        {serviceTypeData.map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                bgcolor: item.color, 
                                borderRadius: '50%', 
                                mr: 1 
                              }} 
                            />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {item.value}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Data Tables */}
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Latest Bookings
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Booking ID</TableCell>
                              <TableCell>User</TableCell>
                              <TableCell>Service</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bookings.slice(0, 5).map((booking) => (
                              <TableRow key={booking._id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    #{booking._id.slice(-6)}
                                  </Typography>
                                </TableCell>
                                <TableCell>{booking.customer?.name || 'N/A'}</TableCell>
                                <TableCell>{booking.serviceType || 'Car Wash'}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={booking.status} 
                                    color={getStatusColor(booking.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {new Date(booking.scheduledDate || booking.date).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Pending Requests
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Request ID</TableCell>
                              <TableCell>User</TableCell>
                              <TableCell>Service</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bookings.filter(b => b.status === 'pending').slice(0, 5).map((booking) => (
                              <TableRow key={booking._id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    #{booking._id.slice(-6)}
                                  </Typography>
                                </TableCell>
                                <TableCell>{booking.customer?.name || 'N/A'}</TableCell>
                                <TableCell>{booking.serviceType || 'Car Wash'}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label="Pending" 
                                    color="warning"
                                    size="small"
                                    icon={<ScheduleIcon />}
                                  />
                                </TableCell>
                                <TableCell>
                                  {new Date(booking.scheduledDate || booking.date).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Other sections remain the same as original */}
          {activeSection === 'users' && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Users</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {users.map(u => (
                  <Grid key={u._id} item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={700}>{u.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                      <Typography variant="body2" color="text.secondary">{u.phone || 'No phone'}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {activeSection === 'bookings' && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Manage Bookings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {bookings.map((b) => (
                  <Grid key={b._id} item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <AssignmentIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight={700}>{b.serviceType}</Typography>
                        <Box sx={{ flex: 1 }} />
                        <Typography variant="caption" color="text.secondary">{new Date(b.scheduledDate).toLocaleDateString()} {b.scheduledTime}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">Customer: {b.customer?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Vehicle: {b.vehicleInfo?.make} {b.vehicleInfo?.model}</Typography>
                      <Typography variant="body2" color="text.secondary">Status: {b.status?.replace('_',' ')}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <TextField
                          select
                          size="small"
                          label="Assign Mechanic"
                          value={b.mechanic?._id || ''}
                          onChange={async (e) => {
                            try {
                              await apiClient.putJson(`/api/bookings/${b._id}/assign`, { mechanicId: e.target.value, status: 'confirmed' });
                              const bookingsRes = await apiClient.getJson('/api/bookings?limit=50');
                              setBookings(bookingsRes.bookings || []);
                              setToast({ open: true, type: 'success', message: 'Assigned successfully' });
                            } catch (er) {
                              setToast({ open: true, type: 'error', message: er?.message || 'Assign failed' });
                            }
                          }}
                          disabled={false}
                          sx={{ minWidth: 220 }}
                        >
                          <MenuItem value="">Select mechanic...</MenuItem>
                          {mechanics.map((m) => (
                            <MenuItem key={m._id} value={m._id}>{m.user?.name} ({(m.specialization||[])[0] || 'General'})</MenuItem>
                          ))}
                        </TextField>
                        {b.status === 'pending' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={async () => {
                              try {
                                await apiClient.putJson(`/api/bookings/${b._id}/status`, { status: 'confirmed' });
                                const bookingsRes = await apiClient.getJson('/api/bookings?limit=50');
                                setBookings(bookingsRes.bookings || []);
                                setToast({ open: true, type: 'success', message: 'Booking approved' });
                              } catch (er) {
                                setToast({ open: true, type: 'error', message: er?.message || 'Approve failed' });
                              }
                            }}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button size="small" variant="outlined" disabled>Approved</Button>
                        )}
                        {b.mechanic?.user?.name && (
                          <Button size="small" disabled variant="outlined">{b.mechanic.user.name}</Button>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {activeSection === 'mechanic_mgmt' && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Mechanic Management</Typography>
                <Button variant="contained" onClick={() => { setMechForm({ id:'', name:'', email:'', phone:'', password:'', specialization:[], experience:'', hourlyRate:'', serviceArea:[], bio:'' }); setMechFormOpen(true); }}>Add Mechanic</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {mechanics.map((m) => (
                  <Grid key={m._id} item xs={12} md={6} lg={4}>
                    <Paper elevation={0} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>{m.user?.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{m.user?.email || 'No email'}</Typography>
                          <Typography variant="caption" color="text.secondary">ID: {m.user?.mechanicId || '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="outlined" onClick={() => {
                            setMechForm({
                              id: m._id,
                              name: m.user?.name || '',
                              email: m.user?.email || '',
                              phone: m.user?.phone || '',
                              password: '',
                              specialization: m.specialization || [],
                              experience: m.experience ?? '',
                              hourlyRate: m.hourlyRate ?? '',
                              serviceArea: m.serviceArea || [],
                              bio: m.bio || ''
                            });
                            setMechFormOpen(true);
                          }}>Edit</Button>
                          <Button size="small" color="error" variant="outlined" onClick={async () => {
                            if (!window.confirm('Delete this mechanic? This removes the profile.')) return;
                            try {
                              setMechLoading(true);
                              await apiClient.deleteJson(`/api/admin/mechanics/${m._id}`);
                              const res = await apiClient.getJson('/api/admin/mechanics?limit=50');
                              setMechanics(res.mechanics || []);
                              setToast({ open: true, type: 'success', message: 'Deleted mechanic' });
                            } catch (er) {
                              setToast({ open: true, type: 'error', message: er?.message || 'Delete failed' });
                            } finally {
                              setMechLoading(false);
                            }
                          }}>Delete</Button>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">Skills: {(m.specialization || []).join(', ') || '—'}</Typography>
                      <Typography variant="body2" color="text.secondary">Experience: {m.experience ?? 0} yrs</Typography>
                      <Typography variant="body2" color="text.secondary">Rate: ${m.hourlyRate ?? 0}/hr</Typography>
                      <Typography variant="body2" color="text.secondary">Areas: {(m.serviceArea || []).join(', ') || '—'}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Drawer Form */}
              <Drawer anchor="right" open={mechFormOpen} onClose={() => setMechFormOpen(false)}>
                <Box sx={{ width: { xs: 360, md: 480 }, p: 3 }} role="presentation">
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Edit Mechanic</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}><TextField fullWidth label="Name" value={mechForm.name} onChange={(e)=>setMechForm({ ...mechForm, name: e.target.value })} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Email" value={mechForm.email} onChange={(e)=>setMechForm({ ...mechForm, email: e.target.value })} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Phone" value={mechForm.phone} onChange={(e)=>setMechForm({ ...mechForm, phone: e.target.value })} /></Grid>
                    {!mechForm.id && (
                      <Grid item xs={12}><TextField fullWidth label="Temporary Password" value={mechForm.password} onChange={(e)=>setMechForm({ ...mechForm, password: e.target.value })} helperText="Optional. Will be generated if blank." /></Grid>
                    )}
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="specs-label">Specializations</InputLabel>
                        <Select
                          labelId="specs-label"
                          multiple
                          value={mechForm.specialization}
                          label="Specializations"
                          renderValue={(selected) => (selected || []).join(', ')}
                          onChange={(e) => {
                            const value = e.target.value;
                            setMechForm({ ...mechForm, specialization: Array.isArray(value) ? value : [] });
                          }}
                        >
                          {SPECIALIZATIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}><TextField fullWidth type="number" label="Experience (years)" value={mechForm.experience} onChange={(e)=>setMechForm({ ...mechForm, experience: e.target.value })} /></Grid>
                    <Grid item xs={6}><TextField fullWidth type="number" label="Hourly Rate" value={mechForm.hourlyRate} onChange={(e)=>setMechForm({ ...mechForm, hourlyRate: e.target.value })} /></Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Service Areas (comma-separated)" value={mechForm.serviceArea.join(', ')} onChange={(e)=>setMechForm({ ...mechForm, serviceArea: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
                    </Grid>
                    <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Bio" value={mechForm.bio} onChange={(e)=>setMechForm({ ...mechForm, bio: e.target.value })} /></Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button variant="outlined" onClick={() => setMechFormOpen(false)}>Cancel</Button>
                    <Button variant="contained" disabled={mechLoading} onClick={async () => {
                      try {
                        setMechLoading(true);
                        if (mechForm.id) {
                          // Update
                          const payload = {
                            name: mechForm.name,
                            email: mechForm.email,
                            phone: mechForm.phone,
                            specialization: mechForm.specialization,
                            experience: Number(mechForm.experience),
                            hourlyRate: Number(mechForm.hourlyRate),
                            serviceArea: mechForm.serviceArea,
                            bio: mechForm.bio
                          };
                          await apiClient.putJson(`/api/admin/mechanics/${mechForm.id}`, payload);
                          setToast({ open: true, type: 'success', message: 'Updated mechanic' });
                        } else {
                          // Create
                          const payload = {
                            name: mechForm.name,
                            email: mechForm.email,
                            phone: mechForm.phone || undefined,
                            password: mechForm.password || undefined,
                            specialization: mechForm.specialization,
                            experience: Number(mechForm.experience),
                            hourlyRate: Number(mechForm.hourlyRate),
                            serviceArea: mechForm.serviceArea,
                            bio: mechForm.bio || undefined
                          };
                          await apiClient.postJson('/api/admin/mechanics', payload);
                          setToast({ open: true, type: 'success', message: 'Created mechanic' });
                        }
                        const res = await apiClient.getJson('/api/admin/mechanics?limit=50');
                        setMechanics(res.mechanics || []);
                        setMechFormOpen(false);
                      } catch (er) {
                        setToast({ open: true, type: 'error', message: er?.message || 'Save failed' });
                      } finally {
                        setMechLoading(false);
                      }
                    }}>Save</Button>
                  </Box>
                </Box>
              </Drawer>
            </Paper>
          )}

          {activeSection === 'carwash_mgmt' && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Car Wash Management</Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={refreshCarWashBookings}
                >
                  Refresh
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {(carWashBookings || []).map((b) => (
                  <Grid key={b._id} item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={700}>{b.serviceType || 'Car Wash'}</Typography>
                      <Typography variant="body2" color="text.secondary">Customer: {b.customerId?.name || '—'}</Typography>
                      <Typography variant="body2" color="text.secondary">Date: {new Date(b.date).toLocaleDateString()} {b.timeSlot}</Typography>
                      <Typography variant="body2" color="text.secondary">Location: {b.location}</Typography>
                      <Typography variant="body2" color="text.secondary">Status: {b.status}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Payment: {b.paymentStatus} {b.paymentStatus === 'Paid' ? `(${b.payment?.amount ? `₹${b.payment.amount}` : ''})` : ''}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="success" 
                          onClick={async () => {
                            try {
                              await apiClient.putJson(`/api/carwash/${b._id}/status`, { status: 'Confirmed' });
                              const res = await apiClient.getJson('/api/carwash?limit=100');
                              setCarWashBookings(res.bookings || []);
                              // Refresh overview stats as well
                              refreshOverviewStats();
                              setToast({ open: true, type: 'success', message: 'Approved' });
                            } catch (er) {
                              setToast({ open: true, type: 'error', message: er?.message || 'Approve failed' });
                            }
                          }}
                          disabled={b.status === 'Confirmed' || b.status === 'In Progress' || b.status === 'Completed'}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error" 
                          onClick={async () => {
                            try {
                              await apiClient.putJson(`/api/carwash/${b._id}/status`, { status: 'Cancelled' });
                              const res = await apiClient.getJson('/api/carwash?limit=100');
                              setCarWashBookings(res.bookings || []);
                              // Refresh overview stats as well
                              refreshOverviewStats();
                              setToast({ open: true, type: 'success', message: 'Cancelled' });
                            } catch (er) {
                              setToast({ open: true, type: 'error', message: er?.message || 'Cancel failed' });
                            }
                          }}
                          disabled={b.status === 'Cancelled' || b.status === 'Completed'}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {activeSection === 'accessories_inventory' && (
            <AccessoriesManagement />
          )}

          {activeSection === 'accessory_orders' && (
            <AccessoryOrdersManagement />
          )}

          {activeSection === 'spares_inventory' && (
            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Spare Parts Inventory</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">Manage products, stock levels, and pricing. (Coming next: full UI)</Typography>
            </Paper>
          )}

          {activeSection === 'cars_sales' && (
            <Box>
              {/* Car Sales Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                  Second-hand Car Sales
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/cars/add')}
                >
                  Add New Car
                </Button>
              </Box>
              
              {/* Car Listings */}
              <CarListingsEmbedded />
            </Box>
          )}

        </Box>
      </Box>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={3000} 
        onClose={() => setToast({ ...toast, open: false })} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide} 
        TransitionProps={{ direction: 'down' }}
      >
        <Alert severity={toast.type} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;