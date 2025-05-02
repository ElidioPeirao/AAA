import  { Tool } from '../types';
import db from '../utils/db';
import GoogleSheetsDB from '../utils/googleSheetsDB';
import { googleSheetsConfig } from '../config/googleSheets';

const googleSheets = new GoogleSheetsDB(googleSheetsConfig);

export async function getAllTools(): Promise<Tool[]> {
  try {
    // Try to get data from Google Sheets first
    const toolsFromSheets = await googleSheets.fetchData('tools');
    if (toolsFromSheets && toolsFromSheets.length > 0) {
      return toolsFromSheets.map(tool => ({
        ...tool,
        isExternal: tool.isExternal === 'true' || tool.isExternal === true
      }));
    }
  } catch (error) {
    console.error('Error fetching tools from Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.getAllTools();
}

export async function getToolsByCategory(category: string): Promise<Tool[]> {
  const allTools = await getAllTools();
  return allTools.filter(tool => tool.category === category);
}

export async function addTool(toolData: Omit<Tool, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
  try {
    // Create a new tool with ID and timestamp
    const newTool = {
      ...toolData,
      id: `tool-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    // Try to insert in Google Sheets
    const inserted = await googleSheets.insertRow('tools', newTool);
    if (inserted) {
      return { success: true, message: 'Ferramenta adicionada com sucesso.' };
    }
  } catch (error) {
    console.error('Error adding tool to Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.addTool(toolData);
}

export async function updateTool(id: string, toolData: Partial<Tool>): Promise<{ success: boolean; message: string }> {
  try {
    // Try to update in Google Sheets
    const updated = await googleSheets.updateRow('tools', id, toolData);
    if (updated) {
      return { success: true, message: 'Ferramenta atualizada com sucesso.' };
    }
  } catch (error) {
    console.error('Error updating tool in Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.updateTool(id, toolData);
}

export async function deleteTool(id: string): Promise<{ success: boolean; message: string }> {
  try {
    // Try to delete in Google Sheets
    const deleted = await googleSheets.deleteRow('tools', id);
    if (deleted) {
      return { success: true, message: 'Ferramenta excluída com sucesso.' };
    }
  } catch (error) {
    console.error('Error deleting tool from Google Sheets:', error);
  }
  
  // Fallback to local DB
  return db.deleteTool(id);
}

export async function searchTools(searchTerm: string): Promise<Tool[]> {
  const allTools = await getAllTools();
  
  if (!searchTerm) return allTools;
  
  const term = searchTerm.toLowerCase();
  return allTools.filter(tool => 
    tool.description.toLowerCase().includes(term) || 
    tool.category.toLowerCase().includes(term) ||
    tool.link.toLowerCase().includes(term)
  );
}
 