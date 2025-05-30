import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { reviewService } from '../services/reviewService';

const LLMUsagePage = () => {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const data = await reviewService.getLLMUsage();
        setUsageData(data);
      } catch (err) {
        setError('Failed to load LLM usage data');
        console.error('Error fetching LLM usage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        LLM Usage Statistics
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Input Tokens
              </Typography>
              <Typography variant="h5">
                {usageData.total_usage.total_input.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Output Tokens
              </Typography>
              <Typography variant="h5">
                {usageData.total_usage.total_output.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Cost
              </Typography>
              <Typography variant="h5">
                ${usageData.total_usage.total_cost.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Usage by Model Table */}
      <Typography variant="h5" gutterBottom>
        Usage by Model
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell align="right">Input Tokens</TableCell>
              <TableCell align="right">Output Tokens</TableCell>
              <TableCell align="right">Total Cost</TableCell>
              <TableCell align="right">Requests</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usageData.usage_by_model.map((model) => (
              <TableRow key={model.llm_model}>
                <TableCell>{model.llm_model}</TableCell>
                <TableCell align="right">{model.total_input.toLocaleString()}</TableCell>
                <TableCell align="right">{model.total_output.toLocaleString()}</TableCell>
                <TableCell align="right">${model.total_cost.toFixed(2)}</TableCell>
                <TableCell align="right">{model.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default LLMUsagePage; 