import React, { useState } from 'react';
import { Card, CardContent, Typography, Rating, TextField, Button, Stack } from '@mui/material';

const FeedbackCard = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    onSubmit?.({ rating, review });
    setRating(0);
    setReview('');
  };

  return (
    <Card 
      sx={{ 
        borderRadius: 3, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
        }
      }} 
      elevation={2}
    >
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1E3A8A' }}>Feedback</Typography>
        <Stack spacing={2}>
          <Rating 
            value={rating} 
            onChange={(_, v) => setRating(v)} 
            size="large"
          />
          <TextField
            multiline
            minRows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with our service"
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={!rating || !review.trim()}
            sx={{ 
              mt: 1,
              py: 1.5,
              backgroundColor: '#1E3A8A',
              '&:hover': {
                backgroundColor: '#3B82F6',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            Submit Feedback
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;