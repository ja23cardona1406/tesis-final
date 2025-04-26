import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Milk as MilkBottle } from 'lucide-react';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Home from './components/Home';
import Analysis from './components/Analysis';
import Dashboard from './components/Dashboard';
import Predictions from './components/Predictions';
import Recommendations from './components/Recommendations';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { logout, checkSession } from './store/slices/authSlice';
import { AppDispatch } from './store/store';

// Componente interno para manejar la navegación
function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, session } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = Boolean(session);

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    // Redirigir al usuario a la página de login después de cerrar sesión
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MilkBottle className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Agrosoft CM</h1>
          </div>
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <a href="/home" className="text-gray-700 hover:text-blue-600">Inicio</a>
                <a href="/analysis" className="text-gray-700 hover:text-blue-600">Análisis</a>   
                <a href="/Dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</a>
                <a href="/predictions" className="text-gray-700 hover:text-blue-600">Predicciones</a>
                <a href="/recommendations" className="text-gray-700 hover:text-blue-600">Recomendaciones</a>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >Cerrar Sesión</button>
                </div>
              </>
            ) : (
              <a href="/login" className="text-gray-700 hover:text-blue-600">Iniciar Sesión</a>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginForm />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterForm />} />
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/home" />} />
        <Route path="/analysis" element={isAuthenticated ? <Analysis /> : <Navigate to="/analysis" />} />
        <Route path="/Dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/Dashboard" />} />
        <Route path="/predictions" element={isAuthenticated ? <Predictions /> : <Navigate to="/predictions" />} />
        <Route path="/recommendations" element={isAuthenticated ? <Recommendations /> : <Navigate to="/recommendations" />} />
      </Routes>

      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p>© 2024 SisLech - Sistema Inteligente de Producción Lechera</p>
          <p className="mt-2 text-gray-400">Valle del Cauca, Colombia</p>
        </div>
      </footer>
    </div>
  );
}

// Componente principal
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;