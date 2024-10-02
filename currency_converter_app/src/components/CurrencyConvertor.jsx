import { useEffect, useState } from "react";
import CurrencySelector from "./CurrencySelector";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { MdOutlineDarkMode, MdLightMode } from "react-icons/md";
import Chart from "chart.js/auto"; // Import Chart.js if you want to use charts

const CurrencyConvertor = () => {
  const [currencies, setCurrencies] = useState([]);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [converting, setConverting] = useState(false);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || ["EUR", "USD"]
  );
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) || false
  );

  // State for historical rates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [historicalData, setHistoricalData] = useState([]);

  // Fetching Currencies from API
  const fetchCurrencies = async () => {
    try {
      const res = await fetch("https://api.frankfurter.app/currencies");
      if (!res.ok) throw new Error("Failed to fetch currencies.");
      const data = await res.json();
      setCurrencies(Object.keys(data));
    } catch (error) {
      setError("Error fetching currency data. Please try again.");
      console.error("Error fetching currencies", error);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Currency Conversion from API
  const convertCurrency = async () => {
    if (!amount) return;
    setConverting(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
      );
      if (!res.ok) throw new Error("Failed to fetch conversion data.");
      const data = await res.json();
      setExchangeRate(data.rates[toCurrency]);
      setConvertedAmount(data.rates[toCurrency] * amount + " " + toCurrency);
    } catch (error) {
      // Error handling
      setError("Conversion error. Please try again.");
      console.error("Error fetching conversion data", error);
    } finally {
      setConverting(false);
    }
  };

  // Fetch Historical Exchange Rates from API
  const fetchHistoricalRates = async () => {
    if (!startDate || !endDate) {
      setError("Please select a valid date range.");
      return;
    }
    setError("");
    try {
      const res = await fetch(
        `https://api.frankfurter.app/${startDate}..${endDate}?from=${fromCurrency}&to=${toCurrency}`
      );
      if (!res.ok) throw new Error("Failed to fetch historical data.");
      const data = await res.json();
      setHistoricalData(Object.entries(data.rates));
    } catch (error) {
      setError("Error fetching historical data. Please try again.");
      console.error("Error fetching historical data", error);
    }
  };

  // Set and remove currency favorites
  const handleFavorite = (currency) => {
    let updatedFavorites = [...favorites];

    if (favorites.includes(currency)) {
      updatedFavorites = updatedFavorites.filter((fav) => fav !== currency);
    } else {
      updatedFavorites.push(currency);
    }

    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // Currency swap icon
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
    localStorage.setItem("darkMode", JSON.stringify(!darkMode));
  };

  return (
    <div
      className={`max-w-xl mx-auto my-5 p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300 ${
        darkMode ? "dark" : ""
      }`}
    >
      <div className="flex justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
          Currency Converter
        </h2>
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full"
        >
          {darkMode ? (
            <MdLightMode className="text-yellow-400" />
          ) : (
            <MdOutlineDarkMode className="text-gray-800" />
          )}
        </button>
      </div>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <CurrencySelector
          favorites={favorites}
          currencies={currencies}
          title="From:"
          currency={fromCurrency}
          setCurrency={setFromCurrency}
          handleFavorite={handleFavorite}
        />
        {/* Swap currency button */}
        <div className="flex justify-center -mb-5 sm:mb-0">
          <button
            onClick={swapCurrencies}
            className="p-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            <HiArrowsRightLeft className="text-xl text-gray-700 dark:text-gray-200" />
          </button>
        </div>
        <CurrencySelector
          favorites={favorites}
          currencies={currencies}
          currency={toCurrency}
          setCurrency={setToCurrency}
          title="To:"
          handleFavorite={handleFavorite}
        />
      </div>

      {/* Date range inputs */}
      <div className="mt-4">
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          Start Date:
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm mt-1 dark:bg-gray-700 dark:text-gray-300"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="endDate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          End Date:
        </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm mt-1 dark:bg-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Button to fetch historical data */}
      <div className="flex justify-center mt-6">
        <button
          onClick={fetchHistoricalRates}
          className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          View Historical Rates
        </button>
      </div>

      {/* Display historical data */}
      {historicalData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-center text-gray-600 dark:text-gray-400">
            Historical Exchange Rates
          </h3>
          <table className="min-w-full mt-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Date</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Rate</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.map(([date, rates]) => (
                <tr key={date}>
                  <td className="px-4 py-2 border-t text-gray-600 dark:text-gray-300">{date}</td>
                  <td className="px-4 py-2 border-t text-gray-600 dark:text-gray-300">
                    {rates[toCurrency]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          Amount:
        </label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 mt-1"
        />
      </div>

      {/* Convert button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={convertCurrency}
          className={`px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            converting ? "animate-pulse" : ""
          }`}
        >
          Convert
        </button>
      </div>

      {/* Exchange rate display */}
      {exchangeRate && (
        <div className="mt-4 text-lg font-medium text-center text-gray-600 hover:text-gray-500 dark:text-gray-400">
          Exchange Rate: 1 {fromCurrency} = {exchangeRate} {toCurrency}
        </div>
      )}

      {/* Converted Amount Display */}
      {convertedAmount && (
        <div className="mt-4 text-lg font-medium text-center text-orange-600 hover:text-orange-500 dark:text-orange-400">
          Converted Amount: {convertedAmount}
        </div>
      )}
    </div>
  );
};

export default CurrencyConvertor;
