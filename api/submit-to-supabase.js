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

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('Variáveis do Supabase não configuradas:', {
            hasUrl: !!SUPABASE_URL,
            hasKey: !!SUPABASE_ANON_KEY
        });
        return res.status(500).json({ error: 'Configuração do Supabase ausente' });
    }

    try {
        console.log('Enviando para Supabase:', {
            url: SUPABASE_URL,
            data: req.body
        });

        const response = await fetch(`${SUPABASE_URL}/rest/v1/respostas`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                A: req.body.A,
                B: req.body.B,
                C: req.body.C,
                nome: req.body.nome,
                email: req.body.email,
                timestamp: req.body.timestamp
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta do Supabase:', errorText);
            throw new Error(`Falha ao enviar para Supabase: ${response.status} ${errorText}`);
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
