// src/App.js
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import { StockChart } from './components/StockChart';
import { CorrelationHeatmap } from './components/CorrelationHeatmap';
import { stockList } from './services/stockService';

function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStock, setSelectedStock] = useState(stockList[0]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stock Price Analytics
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} centered>
            <Tab label="Stock Price" />
            <Tab label="Correlation Heatmap" />
          </Tabs>
        </Box>

        {selectedTab === 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {stockList.map((ticker) => (
                <Box
                  key={ticker}
                  sx={{
                    mx: 1,
                    p: 1,
                    cursor: 'pointer',
                    bgcolor: selectedStock === ticker ? 'primary.light' : 'transparent',
                    color: selectedStock === ticker ? 'white' : 'text.primary',
                    borderRadius: 1
                  }}
                  onClick={() => setSelectedStock(ticker)}
                >
                  {ticker}
                </Box>
              ))}
            </Box>
            <StockChart ticker={selectedStock} />
          </Box>
        )}

        {selectedTab === 1 && (
          <CorrelationHeatmap />
        )}
      </Container>
    </Box>
  );
}

export default App;