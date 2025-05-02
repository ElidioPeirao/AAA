//  Google Sheets Apps Script para funcionar como banco de dados para o EPROJECTS
// Para configurar:
// 1. Crie uma planilha no Google Sheets com 3 abas: "users", "tools" e "promoCodes"
// 2. Vá para Extensions -> Apps Script
// 3. Cole este código no editor
// 4. Clique em Deploy -> New deployment
// 5. Selecione "Web app" como tipo
// 6. Defina "Who has access" como "Anyone" 
// 7. Clique em "Deploy"
// 8. Copie a URL do web app e pegue o ID (parte final da URL após /exec)

// Configuração das colunas
const SHEETS = {
  users: {
    columns: ['id', 'username', 'email', 'password', 'role', 'proDaysLeft', 'createdAt']
  },
  tools: {
    columns: ['id', 'category', 'description', 'link', 'accessLevel', 'isExternal', 'createdAt']
  },
  promoCodes: {
    columns: ['id', 'code', 'daysGranted', 'usesLeft', 'totalUses', 'createdAt']
  }
};

// Manipulador para solicitações OPTIONS (CORS preflight)
function doOptions(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  
  return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

// Manipulador para solicitações GET
function doGet(e) {
  try {
    // Configuração CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    // Redirecionamento para POST, GET não suporta corpo da requisição
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Por favor, use o método POST para todas as operações'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  } catch (error) {
    return respondWithError(error.toString());
  }
}

// Manipulador para solicitações POST
function doPost(e) {
  try {
    // Configuração CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    // Log para debugging
    Logger.log("Received payload: " + e.postData.contents);
    
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      Logger.log("Error parsing JSON: " + parseError);
      return respondWithError("Invalid JSON: " + parseError.toString(), headers);
    }
    
    if (!payload.action || !payload.sheet) {
      return respondWithError('Parâmetros inválidos: action e sheet são obrigatórios', headers);
    }
    
    const action = payload.action;
    const sheetName = payload.sheet;
    
    if (!SHEETS[sheetName]) {
      return respondWithError(`Planilha "${sheetName}" não encontrada`, headers);
    }
    
    switch (action) {
      case 'read':
        const data = readAll(sheetName);
        return respondWithSuccess(data, headers);
        
      case 'insert':
        if (!payload.data) {
          return respondWithError('Parâmetro "data" ausente para inserção', headers);
        }
        
        const insertResult = insertRow(sheetName, payload.data);
        return respondWithSuccess(insertResult, headers);
        
      case 'update':
        if (!payload.id || !payload.data) {
          return respondWithError('Parâmetros "id" e "data" são obrigatórios para atualização', headers);
        }
        
        const updateResult = updateRow(sheetName, payload.id, payload.data);
        return respondWithSuccess(updateResult, headers);
        
      case 'delete':
        if (!payload.id) {
          return respondWithError('Parâmetro "id" ausente para exclusão', headers);
        }
        
        const deleteResult = deleteRow(sheetName, payload.id);
        return respondWithSuccess(deleteResult, headers);
        
      default:
        return respondWithError(`Ação desconhecida: ${action}`, headers);
    }
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return respondWithError(error.toString());
  }
}

// Lê todos os dados de uma planilha
function readAll(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// Insere uma nova linha na planilha
function insertRow(sheetName, data) {
  const sheet = getOrCreateSheet(sheetName);
  const headers = SHEETS[sheetName].columns;
  
  // Verificar se o ID já existe
  if (data.id) {
    const existingData = readAll(sheetName);
    const exists = existingData.some(row => row.id === data.id);
    
    if (exists) {
      throw new Error(`ID já existe: ${data.id}`);
    }
  }
  
  // Adicionar timestamp
  data.createdAt = new Date().toISOString();
  
  // Preparar valores para inserção, garantindo ordem das colunas
  const values = headers.map(header => {
    if (data[header] !== undefined) {
      return data[header];
    }
    return '';
  });
  
  // Inserir na planilha
  sheet.appendRow(values);
  
  return { success: true, id: data.id };
}

// Atualiza uma linha existente
function updateRow(sheetName, id, data) {
  const sheet = getOrCreateSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idIndex = headers.indexOf('id');
  
  if (idIndex === -1) {
    throw new Error('Coluna ID não encontrada na planilha');
  }
  
  // Encontrar a linha para atualizar
  const values = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] === id) {
      rowIndex = i + 1; // +1 porque getRange é baseado em 1, não 0
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error(`ID não encontrado: ${id}`);
  }
  
  // Atualizar dados
  for (const [key, value] of Object.entries(data)) {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(value);
    }
  }
  
  return { success: true };
}

// Exclui uma linha
function deleteRow(sheetName, id) {
  const sheet = getOrCreateSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idIndex = headers.indexOf('id');
  
  if (idIndex === -1) {
    throw new Error('Coluna ID não encontrada na planilha');
  }
  
  // Encontrar a linha para excluir
  const values = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] === id) {
      rowIndex = i + 1; // +1 porque deleteRow é baseado em 1, não 0
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error(`ID não encontrado: ${id}`);
  }
  
  // Excluir linha
  sheet.deleteRow(rowIndex);
  
  return { success: true };
}

// Obtém ou cria uma planilha
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  // Se a planilha não existir, crie-a com os cabeçalhos corretos
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(SHEETS[sheetName].columns);
    sheet.getRange(1, 1, 1, SHEETS[sheetName].columns.length).setFontWeight('bold');
  }
  
  return sheet;
}

// Resposta de sucesso
function respondWithSuccess(data, headers = {}) {
  const response = ContentService.createTextOutput(JSON.stringify({
    success: true,
    result: data
  }))
  .setMimeType(ContentService.MimeType.JSON);
  
  if (Object.keys(headers).length > 0) {
    response.setHeaders(headers);
  }
  
  return response;
}

// Resposta de erro
function respondWithError(error, headers = {}) {
  const response = ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: error
  }))
  .setMimeType(ContentService.MimeType.JSON);
  
  if (Object.keys(headers).length > 0) {
    response.setHeaders(headers);
  }
  
  return response;
}
 