import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RescheduleModal from './RescheduleModal';

// Mock the apiClient
jest.mock('../../api/client', () => ({
  putJson: jest.fn()
}));

describe('RescheduleModal', () => {
  const mockOnClose = jest.fn();
  const mockOnRescheduled = jest.fn();
  const mockBooking = {
    _id: 'test-booking-id',
    serviceType: 'Engine Repair',
    vehicleInfo: { make: 'Toyota', model: 'Camry' },
    scheduledDate: '2023-06-15T00:00:00.000Z',
    scheduledTime: '10:00'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly when open', () => {
    render(
      <RescheduleModal
        open={true}
        onClose={mockOnClose}
        booking={mockBooking}
        onRescheduled={mockOnRescheduled}
      />
    );

    expect(screen.getByText('Reschedule Booking')).toBeInTheDocument();
    expect(screen.getByText('Booking ID: test-bo')).toBeInTheDocument();
    expect(screen.getByLabelText('New Date *')).toBeInTheDocument();
    expect(screen.getByLabelText('New Time *')).toBeInTheDocument();
  });

  test('prevents submission when date or time is missing', async () => {
    render(
      <RescheduleModal
        open={true}
        onClose={mockOnClose}
        booking={mockBooking}
        onRescheduled={mockOnRescheduled}
      />
    );

    const submitButton = screen.getByText('Reschedule');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select both date and time')).toBeInTheDocument();
    });
  });

  test('prevents submission for past dates', async () => {
    render(
      <RescheduleModal
        open={true}
        onClose={mockOnClose}
        booking={mockBooking}
        onRescheduled={mockOnRescheduled}
      />
    );

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    const dateInput = screen.getByLabelText('New Date *');
    const timeInput = screen.getByLabelText('New Time *');
    
    fireEvent.change(dateInput, {
      target: { value: yesterdayString }
    });
    fireEvent.change(timeInput, {
      target: { value: '14:00' }
    });

    const submitButton = screen.getByText('Reschedule');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Cannot select a past date')).toBeInTheDocument();
    });
  });
});