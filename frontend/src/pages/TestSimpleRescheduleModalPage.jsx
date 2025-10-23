import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import SimpleRescheduleModal from '../components/dashboard/SimpleRescheduleModal';

const TestSimpleRescheduleModalPage = () => {
  const [open, setOpen] = useState(false);
  const [testBooking] = useState({
    _id: 'test-booking-123',
    serviceType: 'Engine Repair',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Camry',
      year: 2020
    },
    scheduledDate: '2023-06-15T10:00:00.000Z',
    scheduledTime: '10:00'
  });

  const handleRescheduled = () => {
    console.log('Booking rescheduled successfully!');
    alert('Booking rescheduled successfully!');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Simple Reschedule Modal Test</Typography>
      <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Open Simple Reschedule Modal
      </Button>
      
      <SimpleRescheduleModal
        open={open}
        onClose={() => setOpen(false)}
        booking={testBooking}
        onRescheduled={handleRescheduled}
      />
    </Box>
  );
};

export default TestSimpleRescheduleModalPage;