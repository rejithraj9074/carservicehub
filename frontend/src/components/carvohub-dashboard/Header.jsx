import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Bell, Menu } from 'lucide-react';

const Header = ({ user, notifications = [], onDrawerToggle, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const userName = user?.name || 'User';
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#1E3A8A',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        mb: 2,
        borderRadius: '0 0 20px 20px',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2, color: 'white' }}
          >
            <Menu />
          </IconButton>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        <IconButton
          color="inherit"
          sx={{ mr: 2, color: 'white' }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <Bell />
          </Badge>
        </IconButton>
        
        <Avatar 
          sx={{ 
            bgcolor: '#3B82F6', 
            color: 'white',
            cursor: 'pointer'
          }}
          onClick={onLogout}
        >
          {userName?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      </Toolbar>
    </AppBar>
  );
};

export default Header;