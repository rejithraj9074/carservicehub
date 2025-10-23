import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Button, Card, CardContent } from '@mui/material';
import apiClient from '../../api/client';

const TestReports = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const testResults = {};
    
    const endpoints = [
      { name: 'Car Stats', url: '/api/admin/cars/stats' },
      { name: 'Seller Stats', url: '/api/admin/sellers/stats' },
      { name: 'Accessory Stats', url: '/api/admin/accessories/stats' },
      { name: 'Order Stats', url: '/api/admin/accessory-orders/stats' },
      { name: 'Overview Stats', url: '/api/admin/overview' },
      { name: 'Mechanic Stats', url: '/api/admin/mechanics/stats' },
      { name: 'Car Wash Stats', url: '/api/carwash/stats' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.name} at ${endpoint.url}`);
        const data = await apiClient.getJson(endpoint.url);
        testResults[endpoint.name] = { success: true, data: data, url: endpoint.url };
        console.log(`${endpoint.name} success:`, data);
      } catch (error) {
        console.error(`${endpoint.name} failed:`, error);
        testResults[endpoint.name] = { success: false, error: error.message, url: endpoint.url };
      }
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    testEndpoints();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Reports API Test
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Testing all reports API endpoints
        </Typography>
      </Box>

      <Button 
        variant="contained" 
        onClick={testEndpoints} 
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Refresh Tests'}
      </Button>

      {Object.entries(results).map(([name, result]) => (
        <Card key={name} sx={{ mb: 2, bgcolor: result.success ? 'success.light' : 'error.light' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600}>
              {name}
            </Typography>
            <Typography variant="body2">
              Status: {result.success ? 'Success' : 'Failed'}
            </Typography>
            <Typography variant="body2">
              URL: {result.url}
            </Typography>
            {result.success ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Data: {JSON.stringify(result.data).substring(0, 100)}...
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Error: {result.error}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}

      {Object.keys(results).length === 0 && !loading && (
        <Alert severity="info">
          No test results available. Click "Refresh Tests" to run the tests.
        </Alert>
      )}
    </Container>
  );
};

export default TestReports;