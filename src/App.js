import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Transactions from './Transactions';
import { auth } from './firebase';
import Wallet from './Wallet';
import Withdraw from './Withdraw';
import Deposit from './Deposit';
import HistoricalData from './HistoricalData';

function App() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/deposit" element={<Deposit />} />
      <Route path="/withdraw" element={<Withdraw />} />
      <Route path="/historical" element={<HistoricalData />} />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
