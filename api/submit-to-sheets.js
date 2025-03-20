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
        
        if (!GOOGLE_SHEET_URL) {
            throw new Error('GOOGLE_SHEET_URL não está configurada');
        }

        const response = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            throw new Error('Falha ao enviar para Google Sheets');
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}