const axios = require('axios');
const { TEST_SERVER_BASE_URL, ACCESS_TOKEN } = require('../config/server');

class StockService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: TEST_SERVER_BASE_URL,
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // In-memory cache to reduce external API calls
        this.stockCache = new Map();
    }

    async getStocksList() {
        try {
            const response = await this.axiosInstance.get('/stocks');
            return response.data.stocks;
        } catch (error) {
            console.error('Error fetching stocks:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getStockPriceHistory(ticker, minutes = 50) {
        try {
            const cacheKey = `${ticker}_${minutes}`;

            // Check cache first
            if (this.stockCache.has(cacheKey)) {
                const cachedData = this.stockCache.get(cacheKey);
                const cacheAge = Date.now() - cachedData.timestamp;

                // Use cache if less than 1 minute old
                if (cacheAge < 60000) {
                    return cachedData.prices;
                }
            }

            const response = await this.axiosInstance.get(`/stocks/${ticker}?minutes=${minutes}`);
            const priceHistory = response.data;

            // Update cache
            this.stockCache.set(cacheKey, {
                prices: priceHistory,
                timestamp: Date.now()
            });

            return priceHistory;
        } catch (error) {
            console.error(`Error fetching price for ${ticker}:`, error.response ? error.response.data : error.message);
            throw error;
        }
    }

    calculateAverageStockPrice(priceHistory) {
        if (!priceHistory || priceHistory.length === 0) return 0;

        const totalPrice = priceHistory.reduce((sum, item) => sum + item.price, 0);
        return totalPrice / priceHistory.length;
    }

    calculateCorrelation(stock1Prices, stock2Prices) {
        try {
            // Ensure we have price data
            if (!stock1Prices || !stock2Prices ||
                stock1Prices.length === 0 || stock2Prices.length === 0) {
                console.warn('Insufficient price data for correlation');
                return 0;
            }

            // Ensure equal length by using the shorter array
            const minLength = Math.min(stock1Prices.length, stock2Prices.length);
            const x = stock1Prices.slice(0, minLength).map(item => item.price);
            const y = stock2Prices.slice(0, minLength).map(item => item.price);

            // Detailed logging
            console.log(`Calculating correlation for ${minLength} data points`);

            // Calculate means
            const meanX = x.reduce((a, b) => a + b, 0) / x.length;
            const meanY = y.reduce((a, b) => a + b, 0) / y.length;

            // Calculate covariance and standard deviations
            let covariance = 0;
            let varX = 0;
            let varY = 0;

            for (let i = 0; i < x.length; i++) {
                const diffX = x[i] - meanX;
                const diffY = y[i] - meanY;

                covariance += diffX * diffY;
                varX += diffX * diffX;
                varY += diffY * diffY;
            }

            // Adjust for sample size
            covariance /= (x.length - 1);
            varY = Math.sqrt(varY / (y.length - 1));

            // Prevent division by zero
            if (varX === 0 || varY === 0) {
                console.warn('Standard deviation is zero, cannot calculate correlation');
                return 0;
            }

            // Pearson correlation coefficient
            const correlation = covariance / (varX * varY);

            // Round to 2 decimal places for readability
            const roundedCorrelation = Number(correlation.toFixed(2));

            console.log(`Correlation calculated: ${roundedCorrelation}`);

            // Validate correlation
            return isNaN(roundedCorrelation) ? 0 : roundedCorrelation;
        } catch (error) {
            console.error('Error in correlation calculation:', error);
            return 0;
        }
    }
}

module.exports = new StockService();