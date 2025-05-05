import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { Menu, X, Milk as MilkBottle } from 'lucide-react';
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

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, session } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = Boolean(session);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MilkBottle className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Agrosoft CM</h1>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/home" className="text-gray-700 hover:text-blue-600">Inicio</Link>
                <Link to="/analysis" className="text-gray-700 hover:text-blue-600">Análisis</Link>
                <Link to="/Dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                <Link to="/predictions" className="text-gray-700 hover:text-blue-600">Predicciones</Link>
                <Link to="/recommendations" className="text-gray-700 hover:text-blue-600">Recomendaciones</Link>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >Cerrar Sesión</button>
                </div>
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Iniciar Sesión</Link>
            )}
          </nav>
        </div>

        {/* Mobile nav menu */}
        {menuOpen && (
          <nav className="md:hidden px-4 pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/home" className="block text-gray-700 hover:text-blue-600">Inicio</Link>
                <Link to="/analysis" className="block text-gray-700 hover:text-blue-600">Análisis</Link>
                <Link to="/Dashboard" className="block text-gray-700 hover:text-blue-600">Dashboard</Link>
                <Link to="/predictions" className="block text-gray-700 hover:text-blue-600">Predicciones</Link>
                <Link to="/recommendations" className="block text-gray-700 hover:text-blue-600">Recomendaciones</Link>
                <div className="pt-2 border-t border-gray-200">
                  <span className="block text-sm text-gray-600 mb-1">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >Cerrar Sesión</button>
                </div>
              </>
            ) : (
              <Link to="/login" className="block text-gray-700 hover:text-blue-600">Iniciar Sesión</Link>
            )}
          </nav>
        )}
      </header>

      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginForm />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterForm />} />
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/analysis" element={isAuthenticated ? <Analysis /> : <Navigate to="/login" />} />
        <Route path="/Dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/predictions" element={isAuthenticated ? <Predictions /> : <Navigate to="/login" />} />
        <Route path="/recommendations" element={isAuthenticated ? <Recommendations /> : <Navigate to="/login" />} />
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

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
