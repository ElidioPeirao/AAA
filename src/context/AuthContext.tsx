import  { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';
import db from '../utils/db';
import GoogleSheetsDB from '../utils/googleSheetsDB';
import { googleSheetsConfig } from '../config/googleSheets';
import { usePromoCode } from '../services/promoCodeService';

const googleSheets = new GoogleSheetsDB(googleSheetsConfig);

interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string, promoCode?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isPro: () => boolean;
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for logged in user in localStorage
    const user = db.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  async function register(username: string, email: string, password: string, promoCode?: string) {
    try {
      let role: UserRole = 'Basic';
      let proDaysLeft = 0;
      
      // Special code for admin
      if (promoCode === 'ELIDIOFODA') {
        role = 'Admin';
        proDaysLeft = 9999;
      } else if (promoCode) {
        // Check if promo code is valid in Google Sheets
        const allCodes = await googleSheets.fetchData('promoCodes');
        const validCode = allCodes.find(code => 
          code.code === promoCode && code.usesLeft > 0
        );
        
        if (validCode) {
          role = 'Pro';
          proDaysLeft = validCode.daysGranted;
          
          // Update uses left
          await googleSheets.updateRow('promoCodes', validCode.id, {
            ...validCode,
            usesLeft: validCode.usesLeft - 1
          });
        } else if (promoCode) {
          return { success: false, message: 'Código promocional inválido ou expirado.' };
        }
      }
      
      // Create a new user
      const newUser = {
        id: `user-${Date.now()}`,
        username,
        email,
        password,
        role,
        proDaysLeft,
        createdAt: new Date().toISOString()
      };
      
      // Try to add to Google Sheets
      try {
        await googleSheets.insertRow('users', newUser);
      } catch (sheetError) {
        console.error('Error adding user to Google Sheets:', sheetError);
        // Fall back to local registration if Google Sheets fails
        return db.register(username, email, password, promoCode);
      }
      
      // Save to local storage as well
      db.users.push(newUser);
      db.saveToLocalStorage();
      
      // Auto login after successful registration
      setCurrentUser(newUser);
      
      return { success: true, message: 'Conta criada com sucesso!' };
    } catch (error: any) {
      console.error('Error during registration:', error);
      return { success: false, message: error.message || 'Erro ao criar conta.' };
    }
  }

  async function login(email: string, password: string) {
    try {
      // Try to fetch users from Google Sheets
      const usersFromSheets = await googleSheets.fetchData('users');
      
      // Find user by email and password
      const user = usersFromSheets.find(u => u.email === email && u.password === password);
      
      if (user) {
        setCurrentUser(user);
        // Update local storage
        db.currentUser = user;
        db.saveToLocalStorage();
        return { success: true, message: 'Login realizado com sucesso!' };
      }
      
      // Fallback to local DB if not found in sheets
      const localResult = db.login(email, password);
      if (localResult.success) {
        setCurrentUser(db.getCurrentUser());
      }
      
      return localResult;
    } catch (error: any) {
      console.error('Error during login:', error);
      
      // Fallback to local DB
      const result = db.login(email, password);
      if (result.success) {
        setCurrentUser(db.getCurrentUser());
      }
      
      return result;
    }
  }

  async function logout() {
    db.logout();
    setCurrentUser(null);
  }

  function isAdmin() {
    return currentUser?.role === 'Admin';
  }

  function isPro() {
    return currentUser?.role === 'Pro' || currentUser?.role === 'Admin';
  }

  async function updateUserProfile(userId: string, data: Partial<User>) {
    try {
      if (!isAdmin() && currentUser?.id !== userId) {
        return { success: false, message: 'Permissão negada.' };
      }
      
      // Try to update in Google Sheets
      const updated = await googleSheets.updateRow('users', userId, data);
      
      if (updated) {
        // Update current user if updating self
        if (currentUser?.id === userId) {
          const updatedUser = { ...currentUser, ...data };
          setCurrentUser(updatedUser);
          db.currentUser = updatedUser;
          db.saveToLocalStorage();
        }
        
        return { success: true, message: 'Perfil atualizado com sucesso.' };
      }
      
      // Fallback to local DB
      const result = await db.updateUser(userId, data);
      
      // Update current user if updating self
      if (result.success && currentUser?.id === userId) {
        const updatedUser = db.getCurrentUser();
        setCurrentUser(updatedUser);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { success: false, message: error.message || 'Erro ao atualizar perfil.' };
    }
  }

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isPro,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
 