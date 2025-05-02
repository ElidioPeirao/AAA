import  { PromoCode } from '../types';
import db from '../utils/db';
import GoogleSheetsDB from '../utils/googleSheetsDB';
import { googleSheetsConfig } from '../config/googleSheets';

const googleSheets = new GoogleSheetsDB(googleSheetsConfig);

export async function getAllPromoCodes(): Promise<PromoCode[]> {
  try {
    // Try to get data from Google Sheets first
    const codesFromSheets = await googleSheets.fetchData('promoCodes');
    if (codesFromSheets && codesFromSheets.length > 0) {
      return codesFromSheets.map(code => ({
        ...code,
        daysGranted: Number(code.daysGranted),
        usesLeft: Number(code.usesLeft),
        totalUses: Number(code.totalUses)
      }));
    }
  } catch (error) {
    console.error('Error fetching promo codes from Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.getAllPromoCodes();
}

export async function createPromoCode(
  daysGranted: number, 
  totalUses: number
): Promise<{ success: boolean; code?: string; message: string }> {
  try {
    // Generate a random code
    const code = 'PRO' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const newPromoCode = {
      id: `promo-${Date.now()}`,
      code,
      daysGranted,
      usesLeft: totalUses,
      totalUses,
      createdAt: new Date().toISOString()
    };
    
    // Try to insert in Google Sheets
    const inserted = await googleSheets.insertRow('promoCodes', newPromoCode);
    if (inserted) {
      return { success: true, code, message: 'Código promocional criado com sucesso.' };
    }
  } catch (error) {
    console.error('Error creating promo code in Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.createPromoCode(daysGranted, totalUses);
}

export async function deletePromoCode(id: string): Promise<{ success: boolean; message: string }> {
  try {
    // Try to delete in Google Sheets
    const deleted = await googleSheets.deleteRow('promoCodes', id);
    if (deleted) {
      return { success: true, message: 'Código promocional excluído com sucesso.' };
    }
  } catch (error) {
    console.error('Error deleting promo code from Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.deletePromoCode(id);
}

export async function usePromoCode(code: string): Promise<{ 
  success: boolean; 
  message: string;
  daysGranted?: number;
}> {
  try {
    // Get all promo codes
    const allCodes = await getAllPromoCodes();
    const promoCode = allCodes.find(p => p.code === code && p.usesLeft > 0);
    
    if (!promoCode) {
      return { success: false, message: 'Código promocional inválido ou expirado.' };
    }
    
    // Update uses left
    const updatedCode = {
      ...promoCode,
      usesLeft: promoCode.usesLeft - 1
    };
    
    // Try to update in Google Sheets
    await googleSheets.updateRow('promoCodes', promoCode.id, updatedCode);
    
    return { 
      success: true, 
      message: 'Código promocional aplicado com sucesso!',
      daysGranted: promoCode.daysGranted
    };
  } catch (error) {
    console.error('Error using promo code:', error);
    return { success: false, message: 'Erro ao aplicar código promocional.' };
  }
}
 