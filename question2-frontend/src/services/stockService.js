import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // Increased timeout to 15 seconds
});

// Error handler
const handleApiError = (error) => {
    console.error('API Error:', error);

    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error Response Data:', error.response.data);
        console.error('Error Status:', error.response.status);

        // Provide more specific error messages
        switch (error.response.status) {
            case 400:
                throw new Error('Invalid request parameters');
            case 404:
                throw new Error('Stock data not found');
            case 500:
                throw new Error('Server error. Please try again later.');
            default:
                throw new Error('An unexpected error occurred');
        }
    } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
    } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', error.message);
        throw new Error('Error preparing the request');
    }
};

export const stockService = {
    async getStockPrices(ticker, minutes = 50) {
        try {
            const response = await apiClient.get(`/stocks/${ticker}`, {
                params: { minutes }
            });
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    },

    async getStockCorrelation(ticker1, ticker2, minutes = 50) {
        try {
            const response = await apiClient.get(`/stockcorrelation`, {
                params: {
                    ticker: [ticker1, ticker2],
                    minutes
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Correlation error between ${ticker1} and ${ticker2}:`, error);
            // Return a default correlation value instead of throwing an error
            return { correlation: 0 };
        }
    }
};

// Predefined list of stocks
export const stockList = [
    'NVDA', 'PYPL', 'AAPL', 'MSFT', 'GOOGL',
    'AMZN', 'META', 'TSLA', 'AMD', 'V'
];

// Utility function to get a random stock from the list
export const getRandomStock = () => {
    const randomIndex = Math.floor(Math.random() * stockList.length);
    return stockList[randomIndex];
};