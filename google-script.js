function validateCsrfToken(token) {
  return token && typeof token === 'string' && token.length === 36;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validação do CSRF token
    if (!validateCsrfToken(data.csrfToken)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid CSRF token'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setResponseCode(403);
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    sheet.appendRow(data.values);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    status: 'error',
    message: 'Method not allowed' 
  }))
  .setMimeType(ContentService.MimeType.JSON);
}
