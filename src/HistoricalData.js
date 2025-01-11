import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HistoricalData.css';

function HistoricalData() {
    const [currencies, setCurrencies] = useState([]);
    const [currency, setCurrency] = useState('');
    const [data, setData] = useState([]);
    const [average, setAverage] = useState(null);
    const [error, setError] = useState('');
    const [showCurrencyList, setShowCurrencyList] = useState(false);

    // Pobierz listę walut
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await axios.get('http://api.nbp.pl/api/exchangerates/tables/A/');
                setCurrencies(response.data[0].rates.map((rate) => rate.code));
            } catch (err) {
                console.error('Błąd podczas pobierania walut:', err);
                setError('Nie udało się pobrać listy walut.');
            }
        };

        fetchCurrencies();
    }, []);

    const handleFetchData = async () => {
        if (!currency) {
            setError('Proszę wybrać walutę.');
            return;
        }

        setError('');
        try {
            const years = Array.from({ length: 10 }, (_, i) => 2024 - i); // Ostatnie 10 lat
            const yearlyData = [];

            for (const year of years) {
                const response = await axios.get(
                    `http://api.nbp.pl/api/exchangerates/rates/A/${currency}/${year}-01-01/${year}-12-31/`
                );
                const rates = response.data.rates;
                const yearlyAverage =
                    rates.reduce((sum, rate) => sum + rate.mid, 0) / rates.length;

                yearlyData.push({ year, average: yearlyAverage });
            }

            setData(yearlyData);
        } catch (err) {
            console.error('Błąd podczas pobierania danych historycznych:', err);
            setError('Nie udało się pobrać danych historycznych.');
        }
    };

    const handleFetchLongTermAverage = async () => {
        if (!currency) {
            setError('Proszę wybrać walutę.');
            return;
        }

        setError('');
        try {
            const years = Array.from({ length: 20 }, (_, i) => 2024 - i); // Ostatnie 20 lat
            let allRates = [];

            for (const year of years) {
                try {
                    const response = await axios.get(
                        `http://api.nbp.pl/api/exchangerates/rates/A/${currency}/${year}-01-01/${year}-12-31/`
                    );
                    allRates = allRates.concat(response.data.rates.map((rate) => rate.mid));
                } catch (err) {
                    console.warn(`Brak danych dla roku ${year}`);
                }
            }

            const avg = allRates.reduce((sum, rate) => sum + rate, 0) / allRates.length;
            setAverage(avg.toFixed(2));
            setData([]);
        } catch (err) {
            console.error('Błąd podczas obliczania średniej:', err);
            setError('Nie udało się obliczyć średniej z ostatnich 20 lat.');
        }
    };

    const handleSelectCurrency = (selectedCurrency) => {
        setCurrency(selectedCurrency);
        setShowCurrencyList(false); // Zamknij listę walut po wyborze
    };

    return (
        <div className="historical-container">
            <h1>Historyczne Kursy Walut</h1>
            {error && <p className="error">{error}</p>}

            <div className="form">
                <label>
                    Wybierz walutę:
                    <input
                        type="text"
                        value={currency}
                        onClick={() => setShowCurrencyList(!showCurrencyList)}
                        placeholder="Kliknij, aby wybrać walutę"
                        readOnly
                    />
                </label>

                {showCurrencyList && (
                    <ul className="currency-list">
                        {currencies.map((code) => (
                            <li key={code} onClick={() => handleSelectCurrency(code)}>
                                {code}
                            </li>
                        ))}
                    </ul>
                )}

                <button onClick={handleFetchData}>Pobierz dane historyczne</button>
                <button onClick={handleFetchLongTermAverage}>
                    Oblicz średnią z ostatnich 20 lat
                </button>
            </div>

            {average && (
                <div className="average">
                    <h3>Średnia:</h3>
                    <p>{average} PLN</p>
                </div>
            )}

            {data.length > 0 && (
                <table className="historical-table">
                    <thead>
                        <tr>
                            <th>Rok</th>
                            <th>Średni kurs (PLN)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((entry) => (
                            <tr key={entry.year}>
                                <td>{entry.year}</td>
                                <td>{entry.average.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default HistoricalData;
