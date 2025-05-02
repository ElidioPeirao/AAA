//  Integration with Google Sheets as a database backend using JDoodle proxy
export interface GoogleSheetsConfig {
  sheetId: string;
}

export default class GoogleSheetsDB {
  private config: GoogleSheetsConfig;
  
  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }
  
  async fetchData(sheetName: string): Promise<any[]> {
    try {
      // Using JDoodle proxy to access Google Sheets
      const proxyUrl = `https://hooks.jdoodle.net/proxy?url=https://script.google.com/macros/s/${this.config.sheetId}/exec`;
      
      const payload = {
        action: 'read',
        sheet: sheetName
      };
      
      const response = await fetch(proxyUrl, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      return [];
    }
  }
  
  async insertRow(sheetName: string, rowData: Record<string, any>): Promise<boolean> {
    try {
      // Using JDoodle proxy to access Google Sheets
      const proxyUrl = `https://hooks.jdoodle.net/proxy?url=https://script.google.com/macros/s/${this.config.sheetId}/exec`;
      
      const payload = {
        action: 'insert',
        sheet: sheetName,
        data: rowData
      };
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error inserting data to Google Sheets:', error);
      throw new Error('Error inserting data to Google Sheets: ' + error);
    }
  }
  
  async updateRow(sheetName: string, rowId: string, rowData: Record<string, any>): Promise<boolean> {
    try {
      // Using JDoodle proxy to access Google Sheets
      const proxyUrl = `https://hooks.jdoodle.net/proxy?url=https://script.google.com/macros/s/${this.config.sheetId}/exec`;
      
      const payload = {
        action: 'update',
        sheet: sheetName,
        id: rowId,
        data: rowData
      };
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error updating data in Google Sheets:', error);
      return false;
    }
  }
  
  async deleteRow(sheetName: string, rowId: string): Promise<boolean> {
    try {
      // Using JDoodle proxy to access Google Sheets
      const proxyUrl = `https://hooks.jdoodle.net/proxy?url=https://script.google.com/macros/s/${this.config.sheetId}/exec`;
      
      const payload = {
        action: 'delete',
        sheet: sheetName,
        id: rowId
      };
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error deleting data from Google Sheets:', error);
      return false;
    }
  }
}
 