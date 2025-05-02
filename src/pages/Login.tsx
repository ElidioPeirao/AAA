import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wrench, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    promoCode: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const { email, password } = formData;
    
    if (!validateEmail(email)) {
      setError('Email inválido.');
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }
    
    const result = await login(email, password);
    
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const { username, email, password, promoCode } = formData;
    
    if (!username || username.length < 3) {
      setError('Nome de usuário deve ter pelo menos 3 caracteres.');
      setIsLoading(false);
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Email inválido.');
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }
    
    const result = await register(username, email, password, promoCode);
    
    if (result.success) {
      setSuccess(result.message);
      // Auto login after registration
      await login(email, password);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1531857414472-edf16a1bb78c?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxtZWNoYW5pY2FsJTIwZW5naW5lZXJpbmclMjBnZWFycyUyMGJsYWNrJTIwb3JhbmdlJTIwaW5kdXN0cmlhbCUyMHRvb2xzfGVufDB8fHx8MTc0NjEzOTg0N3ww&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800')" }}>
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-xl rounded-lg">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-secondary">
              EPROJECTS
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Plataforma de engenharia especializada
            </p>
          </div>
          
          <div className="flex border-b">
            <button
              className={`w-1/2 py-2 text-center ${
                activeTab === 'login' ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Entrar
            </button>
            <button
              className={`w-1/2 py-2 text-center ${
                activeTab === 'register' ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('register')}
            >
              Criar conta
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
          
          {activeTab === 'login' ? (
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    Senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="input pr-10"
                    placeholder="Senha"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Processando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleRegister}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="username" className="sr-only">
                    Usuário
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="input pl-10"
                      placeholder="Nome de usuário"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <label htmlFor="register-password" className="sr-only">
                    Senha
                  </label>
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="input pr-10"
                    placeholder="Senha (mínimo 6 caracteres)"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <label htmlFor="promoCode" className="sr-only">
                    Código promocional
                  </label>
                  <input
                    id="promoCode"
                    name="promoCode"
                    type="text"
                    className="input pl-10"
                    placeholder="Código promocional (opcional)"
                    value={formData.promoCode}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <ShieldCheck className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Processando...
                    </span>
                  ) : (
                    "Criar conta"
                  )}
                </button>
              </div>
              
              <div className="text-center text-xs text-gray-500">
                <p>
                  Use o código "ELIDIOFODA" para criar uma conta de administrador.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
 