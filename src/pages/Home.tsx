import  { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      // If user is logged in, redirect to dashboard
      if (currentUser) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [navigate, currentUser, loading]);
  
  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return null;
}
 