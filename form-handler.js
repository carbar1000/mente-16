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
        console.log('Enviando para Google Sheets:', data);
        const sheetsResponse = await fetch('/api/submit-to-sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!sheetsResponse.ok) {
            const errorText = await sheetsResponse.text();
            console.error('Erro Google Sheets:', errorText);
            throw new Error(`Erro Google Sheets: ${sheetsResponse.status} ${errorText}`);
        }
        
        googleSuccess = true;

        // Envio para Supabase
        console.log('Enviando para Supabase:', data);
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

        if (!supabaseResponse.ok) {
            const errorText = await supabaseResponse.text();
            console.error('Erro Supabase:', errorText);
            throw new Error(`Erro Supabase: ${supabaseResponse.status} ${errorText}`);
        }

        supabaseSuccess = true;

    } catch (error) {
        console.error('Erro detalhado:', error);
    } finally {
        if (submitButton) submitButton.disabled = false;
        
        if (googleSuccess || supabaseSuccess) {
            window.location.href = 'obrigado.html?status=success';
        } else {
            window.location.href = 'obrigado.html?status=error';
        }
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



