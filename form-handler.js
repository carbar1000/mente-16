// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lxwljusqjxudgqsnvjnh.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.timestamp = new Date().toISOString();
    
    let googleSuccess = false;
    let supabaseSuccess = false;

    try {
        // Envio para Google Sheets
        const googleResponse = await fetch('https://script.google.com/macros/s/AKfycbzdLpEgmmmlPFV_V-W0s9lF-f3QrtU4fBwmcQEAI5Et962tLFjsLms2FRSivtyYAx_3dA/exec', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        googleSuccess = googleResponse.ok;

        // Envio para Supabase
        const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/respostas`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                A: data.A,
                B: data.B,
                C: data.C,
                nome: data.Nome,
                email: data.Email,
                timestamp: data.timestamp
            })
        });

        supabaseSuccess = supabaseResponse.ok;

        // Redirecionamento baseado no sucesso
        window.location.href = `obrigado.html?status=${(googleSuccess || supabaseSuccess) ? 'success' : 'error'}`;

    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        window.location.href = 'obrigado.html?status=error';
    }
}
