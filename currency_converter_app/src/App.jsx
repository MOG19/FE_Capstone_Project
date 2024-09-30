// 

import React, { useState, useEffect } from 'react';
import { fetchExchangeRates } from './services/api';

function App() {
  const [exchangeRates, setExchangeRates] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getRates() {
      try {
        const data = await fetchExchangeRates(baseCurrency);
        setExchangeRates(data.conversion_rates);
      } catch (err) {
        setError('Error fetching exchange rates.');
      }
    }
    getRates();
  }, [baseCurrency]);

  const convertCurrency = () => {
    if (exchangeRates && targetCurrency) {
      const rate = exchangeRates[targetCurrency];
      setConvertedAmount(amount * rate);
    }
  };

  useEffect(() => {
    if (exchangeRates) convertCurrency();
  }, [amount, targetCurrency, exchangeRates]);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">Currency Converter</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-3">
        <label className="block mb-1">Base Currency:</label>
        <select
          className="p-2 border rounded"
          value={baseCurrency}
          onChange={(e) => setBaseCurrency(e.target.value)}
        >
          {exchangeRates &&
            Object.keys(exchangeRates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Target Currency:</label>
        <select
          className="p-2 border rounded"
          value={targetCurrency}
          onChange={(e) => setTargetCurrency(e.target.value)}
        >
          {exchangeRates &&
            Object.keys(exchangeRates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Amount:</label>
        <input
          type="number"
          className="p-2 border rounded w-full"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <button
          onClick={convertCurrency}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Convert
        </button>
      </div>

      {convertedAmount && (
        <div className="mt-5">
          <h2 className="text-xl">
            {amount} {baseCurrency} = {convertedAmount.toFixed(2)} {targetCurrency}
          </h2>
        </div>
      )}
    </div>
  );
}

export default App;
