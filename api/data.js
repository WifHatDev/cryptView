const axios = require('axios');

// Globale Variablen für die Daten
let coingeckoData = [];
let fundingRates = {
  day: null,
  week: null
};

// Funktion zum Abrufen von CoinGecko-Daten
async function getCoinGeckoData() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: { vs_currency: 'usd' }
    });
    coingeckoData = response.data; // Daten speichern
  } catch (error) {
    console.error('Fehler beim Abrufen von CoinGecko-Daten:', error);
  }
}

// Funktion zum Abrufen von Binance-Funding-Rate-Daten
async function getBinanceData(interval) {
  const symbol = 'BTCUSDT';
  const now = Date.now();
  const startTime = interval === 'week' ? now - 7 * 24 * 60 * 60 * 1000 : 0;
  const endpoint = interval === 'day'
    ? `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}`
    : `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&startTime=${startTime}&endTime=${now}`;

  try {
    const response = await axios.get(endpoint);
    fundingRates[interval] = response.data; // Daten speichern
  } catch (error) {
    console.error('Fehler beim Abrufen von Binance-Daten:', error);
  }
}

// Daten beim Start initialisieren
getCoinGeckoData();
getBinanceData('day');
getBinanceData('week');

// Vercel API-Handler
export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      coingeckoData,
      fundingRates
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
