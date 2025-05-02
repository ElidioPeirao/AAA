import  { User } from '../types';
import db from '../utils/db';
import GoogleSheetsDB from '../utils/googleSheetsDB';
import { googleSheetsConfig } from '../config/googleSheets';

const googleSheets = new GoogleSheetsDB(googleSheetsConfig);

export async function getAllUsers(): Promise<User[]> {
  try {
    // Try to get data from Google Sheets first
    const usersFromSheets = await googleSheets.fetchData('users');
    if (usersFromSheets && usersFromSheets.length > 0) {
      return usersFromSheets.map(user => ({
        ...user,
        proDaysLeft: Number(user.proDaysLeft) // Ensure correct type conversion
      }));
    }
  } catch (error) {
    console.error('Error fetching users from Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.getAllUsers();
}

export async function updateUser(id: string, userData: Partial<User>): Promise<{ success: boolean; message: string }> {
  try {
    // Try to update in Google Sheets
    const updated = await googleSheets.updateRow('users', id, userData);
    if (updated) {
      return { success: true, message: 'Usuário atualizado com sucesso.' };
    }
  } catch (error) {
    console.error('Error updating user in Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.updateUser(id, userData);
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    // Try to delete in Google Sheets
    const deleted = await googleSheets.deleteRow('users', id);
    if (deleted) {
      return { success: true, message: 'Usuário excluído com sucesso.' };
    }
  } catch (error) {
    console.error('Error deleting user from Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.deleteUser(id);
}

export async function searchUsers(searchTerm: string): Promise<User[]> {
  const allUsers = await getAllUsers();
  
  if (!searchTerm) return allUsers;
  
  const term = searchTerm.toLowerCase();
  return allUsers.filter(user => 
    user.username.toLowerCase().includes(term) || 
    user.email.toLowerCase().includes(term) ||
    user.role.toLowerCase().includes(term)
  );
}
 