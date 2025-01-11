import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
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

    // Żądanie pozwolenia na powiadomienia
    React.useEffect(() => {
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
        </div>
    );
}

export default Login;
