import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [currencies, setCurrencies] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (Notification.permission === 'granted') {
                new Notification('Zalogowano pomyślnie!', {
                    body: `Witaj, ${email}!`,
                    icon: '/icon-192x192.png',
                });
            }
            navigate('/home'); // Przejdź do strony głównej
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await axios.get('https://api.nbp.pl/api/exchangerates/tables/A/');
            const rates = response.data[0].rates;
            const popularCurrencies = rates
                .filter((rate) => ['USD', 'EUR', 'GBP', 'JPY', 'CHF'].includes(rate.code))
                .map((rate) => ({
                    currency: rate.currency,
                    code: rate.code,
                    rate: rate.mid,
                }));

            setCurrencies(popularCurrencies);
            setLastUpdated(new Date().toLocaleString());

            localStorage.setItem('currencies', JSON.stringify(popularCurrencies));
            localStorage.setItem('lastUpdated', new Date().toLocaleString());
        } catch (err) {
            console.error('Błąd podczas pobierania kursów walut:', err);
            setError('Nie udało się pobrać kursów walut.');
        }
    };

    useEffect(() => {
        const handleOffline = () => setIsOffline(!navigator.onLine);
        window.addEventListener('online', handleOffline);
        window.addEventListener('offline', handleOffline);

        fetchCurrencies();

        return () => {
            window.removeEventListener('online', handleOffline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!navigator.onLine) {
            const savedCurrencies = JSON.parse(localStorage.getItem('currencies')) || [];
            const savedLastUpdated = localStorage.getItem('lastUpdated') || null;

            setCurrencies(savedCurrencies);
            setLastUpdated(savedLastUpdated);
            setIsOffline(true);
        }
    }, [isOffline]);

    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <div className="login-container">
            <h1>Logowanie</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleLogin}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label htmlFor="password">Hasło:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Zaloguj się</button>
            </form>
            <button className="register-button" onClick={() => navigate('/register')}>
                Zarejestruj się
            </button>

            <div className="currency-container">
                <h2>Kursy walut</h2>
                {isOffline && lastUpdated && (
                    <p>
                        Jesteś offline. Kursy zostały pobrane: <strong>{lastUpdated}</strong> i mogą być
                        nieaktualne.
                    </p>
                )}
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
            </div>
        </div>
    );
}

export default Login;
