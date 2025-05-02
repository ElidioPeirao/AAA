import  GoogleSheetsDB from '../utils/googleSheetsDB';
import { googleSheetsConfig } from '../config/googleSheets';

// Create a single instance
const googleSheets = new GoogleSheetsDB(googleSheetsConfig);

// Initialize sheets by creating them if they don't exist
export async function initializeSheets() {
  try {
    // Fetch data from each sheet to trigger creation if needed
    await Promise.all([
      googleSheets.fetchData('users'),
      googleSheets.fetchData('tools'),
      googleSheets.fetchData('promoCodes')
    ]);
    
    console.log('Google Sheets initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    return false;
  }
}

// Export the instance for use in other services
export { googleSheets };
 