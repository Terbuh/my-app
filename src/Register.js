import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import './Register.css';

function Register({ navigateToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Rejestracja użytkownika
            await createUserWithEmailAndPassword(auth, email, password);
            alert('Rejestracja zakończona sukcesem. Możesz się zalogować!');
            navigateToLogin(); // Przejście do ekranu logowania
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
            <button onClick={navigateToLogin}>Wróć do logowania</button>
        </div>
    );
}

export default Register;
