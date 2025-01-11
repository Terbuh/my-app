import React from 'react';
import './Transactions.css';

function Transactions() {
    const transactions = [
        { id: 1, date: '2025-01-10', type: 'Kupno', currency: 'USD', amount: 100 },
        { id: 2, date: '2025-01-11', type: 'Sprzedaż', currency: 'EUR', amount: 50 },
    ];

    return (
        <div className="transactions-container">
            <h1>Historia Transakcji</h1>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Typ</th>
                        <th>Waluta</th>
                        <th>Kwota</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <tr key={tx.id}>
                            <td>{tx.date}</td>
                            <td>{tx.type}</td>
                            <td>{tx.currency}</td>
                            <td>{tx.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Transactions;
