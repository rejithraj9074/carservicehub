import React, { useState } from 'react';
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Stack,
  Badge,
  Avatar,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
  Feedback as FeedbackIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const DashboardSidePanel = ({ notifications = [], onNavigate = () => {} }) => {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open dashboard side panel"
        onClick={() => setOpen(true)}
        sx={{
          backgroundColor: 'rgba(0,0,0,0.04)',
          mr: 1,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 300 } }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Quick Panel</Typography>
            <IconButton onClick={() => setOpen(false)} aria-label="close">
              <MenuIcon />
            </IconButton>
          </Stack>
        </Box>
        <Divider />

        <Box sx={{ p: 2, pt: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main' }}>CU</Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Customer</Typography>
              <Typography variant="body2" color="text.secondary">Welcome back</Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 1 }} />

        <List>
          <ListItem button onClick={() => onNavigate('/customer')}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItem>
          <ListItem button onClick={() => onNavigate('/appointments')}>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Appointments" />
          </ListItem>
          <ListItem button onClick={() => onNavigate('/bookings')}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Active Bookings" />
          </ListItem>
          <ListItem button onClick={() => onNavigate('/payments')}>
            <ListItemIcon>
              <PaymentIcon />
            </ListItemIcon>
            <ListItemText primary="Payments" />
          </ListItem>
          <ListItem button onClick={() => onNavigate('/feedback')}>
            <ListItemIcon>
              <FeedbackIcon />
            </ListItemIcon>
            <ListItemText primary="Feedback" />
          </ListItem>
          <ListItem button onClick={() => onNavigate('#notifications')}>
            <ListItemIcon>
              <Badge color="error" badgeContent={unreadCount} overlap="circular">
                <NotificationsIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItem>
        </List>

        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="contained" color="primary" onClick={() => onNavigate('/services')}>
            Book a Service
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default DashboardSidePanel;


