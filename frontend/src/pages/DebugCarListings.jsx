import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField
} from '@mui/material';
import apiClient from '../api/client';

const DebugCarListings = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState('');
  const [testUrl, setTestUrl] = useState('/api/cars');

  // Test direct fetch
  const testDirectFetch = async () => {
    try {
      setLoading(true);
      setError('');
      setApiError('');
      setApiResponse(null);
      
      console.log('Testing direct fetch to:', testUrl);
      
      // Test with fetch directly
      const response = await fetch(testUrl);
      const data = await response.json();
      
      console.log('Direct fetch response:', data);
      setApiResponse(data);
      
      if (data.data) {
        setCars(data.data);
      } else {
        setCars([]);
      }
    } catch (err) {
      console.error('Direct fetch error:', err);
      setApiError(`Direct fetch error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test apiClient
  const testApiClient = async () => {
    try {
      setLoading(true);
      setError('');
      setApiError('');
      setApiResponse(null);
      
      console.log('Testing apiClient to:', testUrl);
      
      const response = await apiClient.getJson(testUrl);
      console.log('apiClient response:', response);
      setApiResponse(response);
      
      if (response.data) {
        setCars(response.data);
      } else {
        setCars([]);
      }
    } catch (err) {
      console.error('apiClient error:', err);
      setError(`apiClient error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test with different URL
  const testWithFullUrl = async () => {
    try {
      setLoading(true);
      setError('');
      setApiError('');
      setApiResponse(null);
      
      const fullUrl = `http://localhost:5000${testUrl}`;
      console.log('Testing full URL:', fullUrl);
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      console.log('Full URL response:', data);
      setApiResponse(data);
      
      if (data.data) {
        setCars(data.data);
      } else {
        setCars([]);
      }
    } catch (err) {
      console.error('Full URL error:', err);
      setApiError(`Full URL error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Debug Car Listings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive debugging for car listing functionality
        </Typography>
      </Box>

      {/* URL Input */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>Test URL</Typography>
        <TextField
          fullWidth
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={testDirectFetch}
            disabled={loading}
          >
            Test Direct Fetch
          </Button>
          <Button
            variant="contained"
            onClick={testApiClient}
            disabled={loading}
          >
            Test API Client
          </Button>
          <Button
            variant="contained"
            onClick={testWithFullUrl}
            disabled={loading}
          >
            Test Full URL
          </Button>
        </Box>
      </Card>

      {/* Errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {apiError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Testing...</Typography>
        </Box>
      )}

      {/* API Response */}
      {apiResponse && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">API Response</Typography>
            <Typography>Success: {apiResponse.success ? 'Yes' : 'No'}</Typography>
            <Typography>Total cars: {apiResponse.data?.length || 0}</Typography>
            {apiResponse.pagination && (
              <>
                <Typography>Pagination pages: {apiResponse.pagination.pages}</Typography>
                <Typography>Pagination total: {apiResponse.pagination.total}</Typography>
                <Typography>Current page: {apiResponse.pagination.current}</Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Car Listings */}
      <Card>
        <CardContent>
          <Typography variant="h6">Car Listings ({cars.length} found)</Typography>
          {cars.length === 0 ? (
            <Typography color="text.secondary">No cars to display</Typography>
          ) : (
            <Grid container spacing={2}>
              {cars.map((car, index) => (
                <Grid item xs={12} md={6} key={car._id || index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{car.title || 'No title'}</Typography>
                      <Typography>Brand: {car.brand || 'No brand'}</Typography>
                      <Typography>Model: {car.model || 'No model'}</Typography>
                      <Typography>Year: {car.year || 'No year'}</Typography>
                      <Typography>Price: ₹{car.price?.toLocaleString('en-IN') || 'No price'}</Typography>
                      <Typography>Status: {car.status || 'No status'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default DebugCarListings;