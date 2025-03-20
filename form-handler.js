async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.timestamp = new Date().toISOString();
    
    let googleSuccess = false;
    let supabaseSuccess = false;

    try {
        // Envio para Google Sheets
        const sheetsResponse = await fetch('/api/submit-to-sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        googleSuccess = sheetsResponse.ok;

        // Envio para Supabase
        const supabaseResponse = await fetch('/api/submit-to-supabase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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

        window.location.href = `obrigado.html?status=${(googleSuccess || supabaseSuccess) ? 'success' : 'error'}`;

    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        if (submitButton) submitButton.disabled = false;
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

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('myForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});


