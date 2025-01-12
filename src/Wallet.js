import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Wallet.css';
import axios from 'axios';
import { auth } from './firebase';

function Wallet() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.uid ? { uid: location.state.uid } : auth.currentUser;

    const [wallet, setWallet] = useState({});
    const [currencyRates, setCurrencyRates] = useState({});
    const [error, setError] = useState('');

    // Pobierz dane portfela użytkownika
    useEffect(() => {
        const fetchWallet = async () => {
            if (!user || !user.uid) {
                setError('Nie jesteś zalogowany.');
                return;
            }

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userSnapshot = await getDoc(userDocRef);

                if (userSnapshot.exists()) {
                    setWallet(userSnapshot.data().wallet || {});
                } else {
                    setWallet({});
                    setError('Brak danych w portfelu.');
                }
            } catch (err) {
                console.error('Błąd podczas pobierania danych portfela:', err);
                setError('Nie udało się pobrać danych portfela.');
            }
        };

        fetchWallet();
    }, [user]);

    // Pobierz kursy walut z API NBP
    useEffect(() => {
        const fetchCurrencyRates = async () => {
            try {
                const response = await axios.get('https://api.nbp.pl/api/exchangerates/tables/A/');
                const rates = response.data[0].rates.reduce((acc, rate) => {
                    acc[rate.code] = rate.mid; // Mapujemy kod waluty na kurs
                    return acc;
                }, {});
                rates['PLN'] = 1; // Dodaj kurs dla PLN (1:1)
                setCurrencyRates(rates);
            } catch (err) {
                console.error('Błąd podczas pobierania kursów walut:', err);
                setError('Nie udało się pobrać kursów walut.');
            }
        };

        fetchCurrencyRates();
    }, []);

    if (!user || !user.uid) {
        return (
            <div>
                <p>Nie jesteś zalogowany. Przekierowywanie...</p>
                {setTimeout(() => navigate('/home'), 3000)}
            </div>
        );
    }

    return (
        <div className="wallet-container">
            <h1>Twój Portfel</h1>
            {error && <p className="error">{error}</p>}
            {Object.keys(wallet).length > 0 ? (
                Object.entries(wallet).map(([currency, amount]) => {
                    const rateToPLN = currencyRates[currency] || 0;
                    const valueInPLN = amount * rateToPLN;

                    return (
                        <div className="wallet-item" key={currency}>
                            <h3>WALUTA</h3>
                            <p>{currency}</p>

                            <h3>ILOŚĆ</h3>
                            <p>{amount.toFixed(2)}</p>

                            <h3>NA PLN</h3>
                            <p>{valueInPLN.toFixed(2)} PLN</p>
                        </div>
                    );
                })
            ) : (
                <p>Brak danych w portfelu.</p>
            )}
            <button onClick={() => navigate('/home')} className="back-button">
                Wróć
            </button>
        </div>
    );
}

export default Wallet;
