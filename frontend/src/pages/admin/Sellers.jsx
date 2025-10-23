import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Pagination,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import apiClient from '../../api/client';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch sellers
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status })
      });

      const response = await apiClient.getJson(`/api/admin/sellers?${params}`);
      setSellers(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [page, filters, fetchSellers]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchSellers();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: ''
    });
  };

  const handleBlockSeller = async (sellerId) => {
    try {
      await apiClient.putJson(`/api/admin/sellers/${sellerId}/block`, {});
      setSuccess('Seller blocked successfully');
      fetchSellers();
    } catch (err) {
      setError(err.message || 'Failed to block seller');
    }
  };

  const handleUnblockSeller = async (sellerId) => {
    try {
      await apiClient.putJson(`/api/admin/sellers/${sellerId}/unblock`, {});
      setSuccess('Seller unblocked successfully');
      fetchSellers();
    } catch (err) {
      setError(err.message || 'Failed to unblock seller');
    }
  };

  const getStatusChip = (isBlocked) => {
    if (isBlocked) {
      return <Chip icon={<BlockIcon />} label="Blocked" color="error" size="small" />;
    }
    return <Chip icon={<CheckCircleIcon />} label="Active" color="success" size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Sellers Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage sellers and their listings
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search sellers..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={applyFilters}
              sx={{ height: 56 }}
            >
              Apply
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: 56 }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Sellers Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Listings</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No sellers found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sellers.map((seller) => (
                      <TableRow key={seller._id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {seller.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {seller.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {seller.contact}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {/* In a real implementation, you would fetch the actual listing count */}
                            0
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(seller.isBlocked)}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => {
                                  setSelectedSeller(seller);
                                  setDialogOpen(true);
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {seller.isBlocked ? (
                              <Tooltip title="Unblock Seller">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleUnblockSeller(seller._id)}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Block Seller">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleBlockSeller(seller._id)}
                                >
                                  <BlockIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Seller Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Seller Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedSeller && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedSeller.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedSeller.email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Contact</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedSeller.contact}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                {getStatusChip(selectedSeller.isBlocked)}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Member Since</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(selectedSeller.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selectedSeller && selectedSeller.isBlocked ? (
            <Button 
              onClick={() => {
                handleUnblockSeller(selectedSeller._id);
                setDialogOpen(false);
              }} 
              variant="contained" 
              color="success"
            >
              Unblock
            </Button>
          ) : (
            <Button 
              onClick={() => {
                handleBlockSeller(selectedSeller._id);
                setDialogOpen(false);
              }} 
              variant="contained" 
              color="error"
            >
              Block
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Sellers;