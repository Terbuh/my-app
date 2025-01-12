import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase'; // Import Firestore
import { doc, setDoc } from 'firebase/firestore'; // Funkcje Firestore
import './Register.css';

function Register({ navigateToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Rejestracja użytkownika w Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Tworzenie dokumentu użytkownika w Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                wallet: {}, // Pusty portfel na start
            });

            alert('Rejestracja zakończona sukcesem. Możesz się zalogować!');
            navigateToLogin();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="register-container">
            <h1>Rejestracja</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleRegister}>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label>Hasło:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Zarejestruj się</button>
            </form>
            <button type="button" onClick={navigateToLogin}>
                Wróć do logowania
            </button>
        </div>
    );
}

export default Register;
