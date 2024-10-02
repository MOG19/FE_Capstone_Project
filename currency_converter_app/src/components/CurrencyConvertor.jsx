import { useEffect, useState } from "react";
import CurrencySelector from "./CurrencySelector";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { MdOutlineDarkMode, MdLightMode } from "react-icons/md";

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

  // Fetching Currencies from api
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

  // Currency Conversion from api
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
   // Seting and removing currency favorites
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
  // Currency sawp icon
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
    <div className={`max-w-xl mx-auto my-5 p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      <div className="flex justify-between mb-5">
        <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-gray-600  dark:text-gray-400">
          Currency Converter
        </h2>
        <button onClick={toggleDarkMode} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full">
          {darkMode ? <MdLightMode className="text-yellow-400" /> : <MdOutlineDarkMode className="text-gray-800" />}
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
        {/* swap currency button */}
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
          className={`px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          ${converting ? "animate-pulse" : ""}`}
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
