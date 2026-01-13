import './App.css'
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import LoginPage from './components/Auth/LoginPage';
import ApartmentSelector from './components/ApartmentSelector/ApartmentSelector';
import Dashboard from './components/Dashboard/Dashboard';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-white)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid var(--primary)',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: 'var(--text-gray)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/apartments" /> : <LoginPage />} 
        />
        <Route 
          path="/apartments" 
          element={user ? <ApartmentSelector /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard/:apartmentId" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/apartments" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}
