import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import { stockService, stockList } from '../services/stockService';

// Utility function to get correlation color
const getCorrelationColor = (correlation) => {
    // Handle potential undefined or null values
    if (correlation == null) return '#F0F0F0'; // Neutral color for missing data

    if (correlation > 0.7) return '#2E8B57';   // Strong Positive (Green)
    if (correlation > 0.3) return '#90EE90';   // Moderate Positive (Light Green)
    if (correlation > -0.3) return '#F0F0F0'; // Neutral (Light Gray)
    if (correlation > -0.7) return '#FFA07A'; // Moderate Negative (Light Salmon)
    return '#FF4500';                         // Strong Negative (Red)
};

export function CorrelationHeatmap() {
    const [correlationMatrix, setCorrelationMatrix] = useState({});
    const [minutes, setMinutes] = useState(50);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function calculateCorrelations() {
            setLoading(true);
            setError(null);
            try {
                const matrix = {};
                const correlationPromises = [];

                // Create an array of correlation promises
                for (let i = 0; i < stockList.length; i++) {
                    for (let j = i; j < stockList.length; j++) {
                        if (i === j) continue; // Skip same stock correlations

                        const ticker1 = stockList[i];
                        const ticker2 = stockList[j];

                        // Add promise to array
                        correlationPromises.push(
                            stockService.getStockCorrelation(ticker1, ticker2, minutes)
                                .then(correlationData => {
                                    // Store correlation in both directions
                                    const key1 = `${ticker1}-${ticker2}`;
                                    const key2 = `${ticker2}-${ticker1}`;
                                    matrix[key1] = correlationData.correlation;
                                    matrix[key2] = correlationData.correlation;
                                })
                                .catch(error => {
                                    console.error(`Correlation error for ${ticker1}-${ticker2}:`, error);
                                    const key1 = `${ticker1}-${ticker2}`;
                                    const key2 = `${ticker2}-${ticker1}`;
                                    matrix[key1] = 0;
                                    matrix[key2] = 0;
                                })
                        );
                    }
                }

                // Wait for all correlations to be calculated
                await Promise.allSettled(correlationPromises);

                // Set the correlation matrix
                setCorrelationMatrix(matrix);
            } catch (error) {
                console.error('Failed to calculate correlations:', error);
                setError('Failed to calculate correlations. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        calculateCorrelations();
    }, [minutes]);

    const minutesOptions = [10, 30, 50, 60, 120];

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Stock Correlation Heatmap</Typography>

                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        label="Time Frame"
                    >
                        {minutesOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option} Minutes
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={1}>
                    {stockList.map((rowTicker, rowIndex) => (
                        <Grid key={rowTicker} container item xs={12}>
                            {stockList.map((colTicker, colIndex) => {
                                let correlation = 0;

                                if (rowIndex !== colIndex) {
                                    const key = `${rowTicker}-${colTicker}`;
                                    correlation = correlationMatrix[key] || 0;
                                }

                                return (
                                    <Grid
                                        item
                                        xs={1}
                                        key={colTicker}
                                        sx={{
                                            height: 50,
                                            bgcolor: rowIndex === colIndex
                                                ? '#E0E0E0' // Slightly different gray for diagonal
                                                : getCorrelationColor(correlation),
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            border: '1px solid rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {rowIndex === colIndex ? (
                                            <Typography variant="caption">{rowTicker}</Typography>
                                        ) : (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: correlation > 0 ? 'green' : 'red',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {correlation.toFixed(2)}
                                            </Typography>
                                        )}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Color Legend */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: '#2E8B57', mr: 1 }} />
                    <Typography variant="caption">Strong Positive (&gt; 0.7)</Typography>

                    <Box sx={{ width: 20, height: 20, bgcolor: '#90EE90', ml: 2, mr: 1 }} />
                    <Typography variant="caption">Moderate Positive (0.3 to 0.7)</Typography>

                    <Box sx={{ width: 20, height: 20, bgcolor: '#F0F0F0', ml: 2, mr: 1 }} />
                    <Typography variant="caption">Neutral (-0.3 to 0.3)</Typography>

                    <Box sx={{ width: 20, height: 20, bgcolor: '#FFA07A', ml: 2, mr: 1 }} />
                    <Typography variant="caption">Moderate Negative (-0.7 to -0.3)</Typography>

                    <Box sx={{ width: 20, height: 20, bgcolor: '#FF4500', ml: 2, mr: 1 }} />
                    <Typography variant="caption">Strong Negative (&lt; -0.7)</Typography>
                </Box>
            </Box>
        </Box>
    );
}