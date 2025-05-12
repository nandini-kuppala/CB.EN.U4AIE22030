import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { stockService } from '../services/stockService';

export function StockChart({ ticker }) {
    const [stockData, setStockData] = useState(null);
    const [minutes, setMinutes] = useState(50);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStockData() {
            setLoading(true);
            try {
                const data = await stockService.getStockPrices(ticker, minutes);
                setStockData(data);
            } catch (error) {
                console.error('Failed to fetch stock data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStockData();
    }, [ticker, minutes]);

    const preparedData = stockData?.priceHistory.map((item, index) => ({
        name: `Point ${index + 1}`,
        price: item.price,
        time: new Date(item.lastUpdatedAt).toLocaleTimeString()
    })) || [];

    const minutesOptions = [10, 30, 50, 60, 120];

    return (
        <Box sx={{ p: 2, width: '100%', height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{ticker} Stock Price</Typography>

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

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={preparedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Price', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <Box sx={{
                                            bgcolor: 'background.paper',
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2
                                        }}>
                                            <Typography variant="body2">Time: {data.time}</Typography>
                                            <Typography variant="body2">Price: ${payload[0].value.toFixed(2)}</Typography>
                                        </Box>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}

            {stockData && (
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                    Average Price: ${stockData.averageStockPrice.toFixed(2)}
                </Typography>
            )}
        </Box>
    );
}