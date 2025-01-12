import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from './firebase'; // Import Firestore
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import axios from 'axios';
import './Deposit.css';

function Deposit() {
    const location = useLocation();
    const navigate = useNavigate();
    const uid = location.state?.uid;

    const [currencies, setCurrencies] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [amount, setAmount] = useState('');
    const [rateToPLN, setRateToPLN] = useState(null); // Kurs wybranej waluty do PLN
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Pobieranie listy walut z API NBP
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await axios.get('https://api.nbp.pl/api/exchangerates/tables/A/');
                const rates = response.data[0].rates;
                setCurrencies(rates.map((rate) => ({ code: rate.code, rate: rate.mid }))); // Pobieramy kod i kurs waluty
            } catch (err) {
                console.error('Błąd podczas pobierania walut:', err);
                setError('Nie udało się pobrać listy walut.');
            }
        };
        fetchCurrencies();
    }, []);

    // Aktualizacja kursu do PLN po wyborze waluty
    useEffect(() => {
        if (selectedCurrency) {
            const selectedRate = currencies.find((currency) => currency.code === selectedCurrency)?.rate || null;
            setRateToPLN(selectedRate);
        }
    }, [selectedCurrency, currencies]);

    const showNotification = (title, body) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    new Notification(title, { body });
                }
            });
        }
    };
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission().catch((err) => {
                console.error('Błąd podczas uzyskiwania uprawnień do powiadomień:', err);
            });
        }
    }, []);

    const handleDeposit = async (e) => {
        e.preventDefault();

        if (!uid) {
            setError('Nie jesteś zalogowany. Zaloguj się ponownie.');
            return;
        }

        if (!selectedCurrency || !amount || parseFloat(amount) <= 0) {
            setError('Wprowadź poprawne dane!');
            setSuccess('');
            return;
        }

        try {
            const userDocRef = doc(db, 'users', uid);
            const userSnapshot = await getDoc(userDocRef);

            let currentBalance = 0;
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                currentBalance = userData.wallet?.[selectedCurrency] || 0;
            }

            const newBalance = currentBalance + parseFloat(amount);

            await updateDoc(userDocRef, {
                [`wallet.${selectedCurrency}`]: newBalance,
            });

            // Oblicz wartość wpłaty w PLN i EUR
            const valueInPLN = rateToPLN * parseFloat(amount);
            const rateToEUR = currencies.find((currency) => currency.code === 'EUR')?.rate || null;
            const valueInEUR = rateToEUR ? parseFloat(amount) * (rateToPLN / rateToEUR) : null;

            // Wyświetl powiadomienie push
            showNotification(
                `Wpłata ${amount} ${selectedCurrency}`,
                `Dodano ${amount} ${selectedCurrency} (PLN: ${valueInPLN.toFixed(2)}, EUR: ${valueInEUR?.toFixed(2)}) przy kursie PLN: ${rateToPLN.toFixed(2)}, EUR: ${rateToEUR?.toFixed(2)}`
            );

            setSuccess(`Wpłata ${amount} ${selectedCurrency} zakończona sukcesem!`);
            setError('');
            setSelectedCurrency('');
            setAmount('');
            setRateToPLN(null);
        } catch (err) {
            console.error('Błąd podczas wpłaty:', err);
            setError('Nie udało się przetworzyć wpłaty.');
            setSuccess('');
        }
    };

    return (
        <div className="deposit-container">
            <h1>Wpłata Walut</h1>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <form onSubmit={handleDeposit}>
                <label>
                    Wybierz walutę:
                    <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        required
                    >
                        <option value="">-- Wybierz walutę --</option>
                        {currencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                                {currency.code}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Kwota:
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="np. 100"
                        required
                    />
                </label>
                {rateToPLN && amount && parseFloat(amount) > 0 && (
                    <p className="estimated-value">
                        Szacunkowa wartość: {(rateToPLN * parseFloat(amount)).toFixed(2)} PLN
                    </p>
                )}
                <button type="submit">Wpłać</button>
            </form>
            <button onClick={() => navigate('/home')} className="back-button">
                Wróć
            </button>
        </div>
    );
}

export default Deposit;
