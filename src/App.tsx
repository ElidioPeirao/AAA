import  { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import CalculadoraMecanica from './pages/CalculadoraMecanica';
import CalculadoraEletrica from './pages/CalculadoraEletrica';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { initializeSheets } from './services/googleSheetsService';

// Initialize sheets when app starts
function InitializeApp() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initialize Google Sheets
    const init = async () => {
      try {
        await initializeSheets();
        console.log('Sheets initialized');
      } catch (error) {
        console.error('Error initializing sheets:', error);
      }
    };
    
    init();
  }, []);
  
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <InitializeApp />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          <Route path="/calculadora-mecanica" element={
            <ProtectedRoute>
              <CalculadoraMecanica />
            </ProtectedRoute>
          } />
          <Route path="/calculadora-eletrica" element={
            <ProtectedRoute>
              <CalculadoraEletrica />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
 