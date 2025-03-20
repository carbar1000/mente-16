export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;
        
        console.log('Verificando configuração:', {
            hasGoogleSheetUrl: !!GOOGLE_SHEET_URL,
            urlLength: GOOGLE_SHEET_URL ? GOOGLE_SHEET_URL.length : 0
        });
        
        if (!GOOGLE_SHEET_URL) {
            console.error('GOOGLE_SHEET_URL não está configurada');
            return res.status(500).json({ error: 'Configuração do Google Sheets ausente' });
        }

        console.log('Enviando para Google Sheets:', {
            url: GOOGLE_SHEET_URL,
            data: req.body
        });

        const response = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta do Google Sheets:', errorText);
            throw new Error(`Falha ao enviar para Google Sheets: ${response.status} ${errorText}`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
