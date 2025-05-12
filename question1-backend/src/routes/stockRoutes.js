const express = require('express');
const stockService = require('../services/stockService');

const router = express.Router();

// Logging middleware
const logRequest = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Query Params:', req.query);
    next();
};

router.use(logRequest);

// GET Average Stock Price
router.get('/stocks/:ticker', async (req, res) => {
    try {
        const { ticker } = req.params;
        const { minutes = 50 } = req.query;

        console.log(`Fetching stock prices for ${ticker} in last ${minutes} minutes`);

        // Fetch price history
        let priceHistory;
        try {
            priceHistory = await stockService.getStockPriceHistory(ticker, Number(minutes));
        } catch (fetchError) {
            console.error('Error fetching price history:', fetchError);
            return res.status(500).json({
                error: 'Failed to retrieve stock prices',
                details: fetchError.message
            });
        }

        // Calculate average
        const averageStockPrice = stockService.calculateAverageStockPrice(priceHistory);

        console.log(`Average Price for ${ticker}: ${averageStockPrice}`);

        res.json({
            averageStockPrice,
            priceHistory
        });
    } catch (error) {
        console.error('Unexpected error in stock price endpoint:', error);
        res.status(500).json({
            error: 'Unexpected error occurred',
            details: error.message
        });
    }
});

// GET Stock Correlation
router.get('/stockcorrelation', async (req, res) => {
    try {
        const { minutes = 50, ticker } = req.query;

        // Ensure exactly 2 tickers
        if (!Array.isArray(ticker) || ticker.length !== 2) {
            console.warn('Invalid number of tickers provided');
            return res.status(400).json({
                error: 'Exactly 2 tickers must be provided',
                details: 'Provide two stock tickers in the "ticker" query parameter'
            });
        }

        const [ticker1, ticker2] = ticker;
        const minutesNum = Number(minutes);

        console.log(`Calculating correlation between ${ticker1} and ${ticker2} for ${minutesNum} minutes`);

        // Fetch price histories
        let stock1Prices, stock2Prices;
        try {
            // Fetch prices concurrently
            const [prices1, prices2] = await Promise.all([
                stockService.getStockPriceHistory(ticker1, minutesNum),
                stockService.getStockPriceHistory(ticker2, minutesNum)
            ]);

            stock1Prices = prices1;
            stock2Prices = prices2;
        } catch (fetchError) {
            console.error('Error fetching price histories:', fetchError);
            return res.status(500).json({
                error: 'Failed to retrieve stock prices',
                details: fetchError.message
            });
        }

        // Calculate correlation
        const correlation = stockService.calculateCorrelation(stock1Prices, stock2Prices);

        console.log(`Correlation between ${ticker1} and ${ticker2}: ${correlation}`);

        res.json({
            correlation,
            stocks: {
                [ticker1]: {
                    averagePrice: stockService.calculateAverageStockPrice(stock1Prices),
                    priceHistory: stock1Prices
                },
                [ticker2]: {
                    averagePrice: stockService.calculateAverageStockPrice(stock2Prices),
                    priceHistory: stock2Prices
                }
            }
        });
    } catch (error) {
        console.error('Unexpected error in stock correlation endpoint:', error);
        res.status(500).json({
            error: 'Unexpected error occurred',
            details: error.message
        });
    }
});

module.exports = router;
