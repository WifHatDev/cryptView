const axios = require('axios');
const cron = require('node-cron');
const express = require('express');
const app = express();

const port = 3000;

// Globale Variablen zum Speichern der Daten
let coingeckoData = [];
let fundingRates = {
  day: null,
  week: null
};

// Funktion zum Abrufen von CoinGecko-Daten
async function getCoinGeckoData() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen von CoinGecko-Daten:', error);
    return [];
  }
}

// Funktion zum Abrufen von Binance-Funding-Rate-Daten
async function getBinanceData(interval) {
  const symbol = 'BTCUSDT';
  const now = Date.now();
  const startTime = interval === 'week' ? now - 7 * 24 * 60 * 60 * 1000 : 0;
  let endpoint = interval === 'day'
    ? `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}`
    : `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&startTime=${startTime}&endTime=${now}`;

  try {
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen von Binance-Daten:', error);
    return [];
  }
}

// API-Endpunkt zum Abrufen der gespeicherten Daten
app.get('/api/data', (req, res) => {
  res.json({
    coingeckoData,
    fundingRates
  });
});

// Jede Minute CoinGecko-Daten abrufen
cron.schedule('* * * * *', async () => {
  coingeckoData = await getCoinGeckoData() || [];
  console.log('CoinGecko-Daten aktualisiert:', coingeckoData.length ? coingeckoData[0] : 'Keine Daten');
});

// Jede Stunde Binance-Daten abrufen
cron.schedule('0 * * * *', async () => {
  fundingRates.day = await getBinanceData('day');
  fundingRates.week = await getBinanceData('week');
  console.log('Binance-Daten aktualisiert');
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
