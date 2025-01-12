import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import './Withdraw.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from './firebase';

function Withdraw() {
    const [currencies, setCurrencies] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [amount, setAmount] = useState('');
    const [rateToPLN, setRateToPLN] = useState(null); // Kurs wybranej waluty do PLN
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.uid ? { uid: location.state.uid } : auth.currentUser;

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

    const handleWithdraw = async (e) => {
        e.preventDefault();

        if (!user || !user.uid) {
            setError('Nie jesteś zalogowany.');
            return;
        }

        if (!selectedCurrency || !amount || parseFloat(amount) <= 0) {
            setError('Wprowadź poprawne dane!');
            setSuccess('');
            return;
        }

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                const currentBalance = userData.wallet?.[selectedCurrency] || 0;

                if (currentBalance < parseFloat(amount)) {
                    setError(`Brak wystarczających środków w ${selectedCurrency}.`);
                    return;
                }

                await updateDoc(userDocRef, {
                    [`wallet.${selectedCurrency}`]: currentBalance - parseFloat(amount),
                });

                setSuccess(`Wypłata ${amount} ${selectedCurrency} zakończona sukcesem!`);
                setError('');
                setSelectedCurrency('');
                setAmount('');
                setRateToPLN(null);
            } else {
                setError('Nie znaleziono portfela użytkownika.');
            }
        } catch (err) {
            console.error('Błąd podczas wypłaty:', err);
            setError('Nie udało się przetworzyć wypłaty.');
            setSuccess('');
        }
    };

    if (!user || !user.uid) {
        return (
            <div>
                <p>Nie jesteś zalogowany. Przekierowywanie...</p>
                {setTimeout(() => navigate('/home'), 3000)}
            </div>
        );
    }

    return (
        <div className="withdraw-container">
            <h1>Wypłata Walut</h1>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <form onSubmit={handleWithdraw}>
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
                <button type="submit">Wypłać</button>
            </form>
            <button onClick={() => navigate('/home')} className="back-button">
                Wróć
            </button>
        </div>
    );
}

export default Withdraw;
