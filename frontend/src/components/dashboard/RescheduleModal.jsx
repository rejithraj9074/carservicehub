import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import apiClient from '../../api/client';

// DEPRECATED: This component is no longer used. Use SimpleRescheduleModal instead.
const RescheduleModal = ({ open, onClose, booking, onRescheduled }) => {
  return null; // Return nothing as this component is deprecated
};

export default RescheduleModal;