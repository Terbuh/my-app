import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from './firebase'; // Import połączenia z Firebase Firestore
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './Exchange.css'; // Opcjonalny plik ze stylami

function Exchange({ user }) {
    const [fromCurrency, setFromCurrency] = useState('');
    const [toCurrency, setToCurrency] = useState('');
    const [amount, setAmount] = useState('');
    const [rates, setRates] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await axios.get('http://api.nbp.pl/api/exchangerates/tables/A/');
                setRates(response.data[0].rates);
            } catch (err) {
                setError('Nie udało się pobrać kursów walut.');
                console.error(err);
            }
        };
        fetchRates();
    }, []);

    const handleExchange = async (e) => {
        e.preventDefault();
        const fromRate = rates.find((rate) => rate.code === fromCurrency)?.mid;
        const toRate = rates.find((rate) => rate.code === toCurrency)?.mid;

        if (!fromRate || !toRate || !amount) {
            setError('Proszę wprowadzić poprawne dane.');
            return;
        }

        const convertedAmount = (parseFloat(amount) * fromRate) / toRate;

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                const currentFromBalance = userData.wallet[fromCurrency] || 0;
                const currentToBalance = userData.wallet[toCurrency] || 0;

                if (currentFromBalance < parseFloat(amount)) {
                    setError('Niewystarczające środki na przewalutowanie.');
                    return;
                }

                await updateDoc(userDocRef, {
                    [`wallet.${fromCurrency}`]: currentFromBalance - parseFloat(amount),
                    [`wallet.${toCurrency}`]: currentToBalance + convertedAmount,
                });

                alert(`Przewalutowanie zakończone sukcesem! Otrzymano ${convertedAmount.toFixed(2)} ${toCurrency}.`);
                setError('');
                setFromCurrency('');
                setToCurrency('');
                setAmount('');
            } else {
                setError('Użytkownik nie został znaleziony.');
            }
        } catch (err) {
            console.error(err);
            setError('Wystąpił błąd podczas przewalutowania.');
        }
    };

    return (
        <div className="exchange-container">
            <h1>Przewalutowanie</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleExchange}>
                <label>
                    Z waluty:
                    <input
                        type="text"
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value.toUpperCase())}
                        placeholder="np. USD"
                        required
                    />
                </label>
                <label>
                    Na walutę:
                    <input
                        type="text"
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value.toUpperCase())}
                        placeholder="np. EUR"
                        required
                    />
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
                <button type="submit">Przewalutuj</button>
            </form>
        </div>
    );
}

export default Exchange;
