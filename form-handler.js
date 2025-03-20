// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lxwljusqjxudgqsnvjnh.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// URL do Google Sheet Web App
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzdLpEgmmmlPFV_V-W0s9lF-f3QrtU4fBwmcQEAI5Et962tLFjsLms2FRSivtyYAx_3dA/exec';

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
        const googleResponse = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'no-cors' // Importante para evitar problemas de CORS
        });
        
        googleSuccess = true; // Como estamos usando no-cors, não podemos verificar response.ok

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

function validateForm() {
    const form = document.getElementById('myForm');
    const requiredFields = ['A', 'B', 'C', 'Nome', 'Email'];
    
    for (const field of requiredFields) {
        const input = form.elements[field];
        if (!input.value) {
            alert(`Por favor, preencha o campo ${field}`);
            return false;
        }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.elements['Email'].value)) {
        alert('Por favor, insira um email válido');
        return false;
    }
    
    return true;
}

// Adicionar event listener ao formulário
document.getElementById('myForm').addEventListener('submit', handleFormSubmit);

