import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import axios from 'axios';
import './Home.css';
import HistoricalData from './HistoricalData';

function Home() {
    const [user, setUser] = useState(auth.currentUser);
    const [currencies, setCurrencies] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Pobierz kursy walut z API NBP
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await axios.get('http://api.nbp.pl/api/exchangerates/tables/A/');
                const rates = response.data[0].rates;
                const popularCurrencies = rates
                    .filter((rate) => ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'NOK', 'SEK', 'DKK'].includes(rate.code))
                    .map((rate) => ({
                        currency: rate.currency,
                        code: rate.code,
                        rate: rate.mid,
                    }));

                setCurrencies(popularCurrencies);
            } catch (err) {
                console.error('Błąd podczas pobierania kursów walut:', err);
                setError('Nie udało się pobrać kursów walut.');
            }
        };

        fetchCurrencies();
    }, []);

    return (
        <div className='wrapper'>
            <h1>Strona Główna</h1>
            {error && <p className="error">{error}</p>}
            {user ? (
                <>
                    <h2>Najpopularniejsze waluty i ich wartość w PLN</h2>
                    <table className="currency-table">
                        <thead>
                            <tr>
                                <th>Waluta</th>
                                <th>Kod</th>
                                <th>Kurs do PLN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currencies.map((currency) => (
                                <tr key={currency.code}>
                                    <td>{currency.currency}</td>
                                    <td>{currency.code}</td>
                                    <td>{currency.rate.toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={() => navigate('/deposit', { state: { uid: user.uid } })}
                        className="home-button"
                    >
                        Wpłata
                    </button>
                    <button
                        onClick={() => navigate('/withdraw', { state: { uid: user.uid } })}
                        className="home-button"
                    >
                        Wypłata
                    </button>
                    <button
                        onClick={() => navigate('/wallet', { state: { uid: user.uid } })}
                        className="home-button"
                    >
                        Moje waluty
                    </button>
                </>
            ) : (
                <p>Musisz być zalogowany, aby zarządzać swoimi walutami.</p>
            )}
            <button
                onClick={() => navigate('/historical', { state: { uid: user.uid } })}
                className="home-button"
            >
                Historia
            </button>
        </div>
    );
}

export default Home;
