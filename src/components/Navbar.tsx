import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <nav className="bg-secondary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Wrench className="h-6 w-6 text-primary mr-2" />
              <span className="text-primary font-bold text-xl tracking-tight">EPROJECTS</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {currentUser && (
              <>
                <Link to="/dashboard" className="px-3 py-2 text-sm font-medium hover:text-primary">
                  Dashboard
                </Link>
                
                {isAdmin() && (
                  <Link to="/admin" className="px-3 py-2 text-sm font-medium hover:text-primary">
                    Administrador
                  </Link>
                )}
                
                <div className="flex items-center space-x-2 ml-4">
                  <User className="h-5 w-5 text-primary" />
                  <span>{currentUser.username}</span>
                  <button 
                    onClick={handleLogout}
                    className="ml-2 text-gray-300 hover:text-primary flex items-center"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
            
            {!currentUser && (
              <Link to="/login" className="px-3 py-2 text-sm font-medium hover:text-primary">
                Entrar / Cadastrar
              </Link>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="sm:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {currentUser && (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 text-base font-medium hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 text-base font-medium hover:bg-gray-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Administrador
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-gray-700 hover:text-white"
                >
                  Sair
                </button>
              </>
            )}
            
            {!currentUser && (
              <Link 
                to="/login" 
                className="block px-3 py-2 text-base font-medium hover:bg-gray-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Entrar / Cadastrar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
 