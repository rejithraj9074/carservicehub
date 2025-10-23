import React, { useState } from 'react';
import { Drawer, IconButton, Badge, List, ListItem, ListItemText, ListItemIcon, Typography, Box } from '@mui/material';
import { Notifications, CheckCircle, Payment, LocalOffer } from '@mui/icons-material';

const NotificationsPanel = ({ notifications = [] }) => {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)} aria-label="notifications">
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} sx={{ '& .MuiDrawer-paper': { width: 360 } }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Notifications</Typography>
        </Box>
        <List>
          {notifications.map((n, idx) => (
            <ListItem key={idx} sx={{ borderBottom: '1px solid #eee' }}>
              <ListItemIcon>
                {n.type === 'booking' && <CheckCircle color="primary" />}
                {n.type === 'payment' && <Payment color="success" />}
                {n.type === 'offer' && <LocalOffer color="warning" />}
              </ListItemIcon>
              <ListItemText primary={n.title} secondary={n.time} />
            </ListItem>
          ))}
          {notifications.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
            </Box>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default NotificationsPanel;


