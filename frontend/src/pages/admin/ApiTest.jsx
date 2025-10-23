import React, { useState } from 'react';
import { Box, Container, Typography, Button, CircularProgress, Card, CardContent, Alert } from '@mui/material';
import apiClient from '../../api/client';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runAllTests = async () => {
    setLoading(true);
    const results = {};
    
    // Test endpoints
    const tests = [
      { name: 'Admin Test', url: '/api/admin/test' },
      { name: 'Admin Overview', url: '/api/admin/overview' },
      { name: 'Car Stats', url: '/api/admin/cars/stats' },
      { name: 'Seller Stats', url: '/api/admin/sellers/stats' },
      { name: 'Accessory Stats', url: '/api/admin/accessories/stats' },
      { name: 'Order Stats', url: '/api/admin/accessory-orders/stats' },
      { name: 'Mechanic Test', url: '/api/admin/mechanics/test' },
      { name: 'Mechanic Stats', url: '/api/admin/mechanics/stats' },
      { name: 'Car Wash Test', url: '/api/carwash/test' },
      { name: 'Car Wash Stats', url: '/api/carwash/stats' }
    ];

    for (const test of tests) {
      try {
        const data = await apiClient.getJson(test.url);
        results[test.name] = { success: true, data, url: test.url };
      } catch (error) {
        results[test.name] = { success: false, error: error.message, url: test.url };
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          API Endpoint Tests
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Testing all admin API endpoints
        </Typography>
      </Box>

      <Button 
        variant="contained" 
        onClick={runAllTests} 
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Run All Tests'}
      </Button>

      {Object.entries(testResults).map(([name, result]) => (
        <Card 
          key={name} 
          sx={{ 
            mb: 2, 
            bgcolor: result.success ? 'success.light' : 'error.light',
            border: '1px solid',
            borderColor: result.success ? 'success.main' : 'error.main'
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={600}>
              {name}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              URL: {result.url}
            </Typography>
            <Typography variant="body2">
              Status: {result.success ? '✅ Success' : '❌ Failed'}
            </Typography>
            {result.success ? (
              <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                Response: {JSON.stringify(result.data).substring(0, 100)}...
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ mt: 1, color: 'error.dark' }}>
                Error: {result.error}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}

      {Object.keys(testResults).length === 0 && !loading && (
        <Alert severity="info">
          Click "Run All Tests" to test the API endpoints.
        </Alert>
      )}
    </Container>
  );
};

export default ApiTest;