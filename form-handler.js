function validateCsrfToken(csrfToken) {
  const storedCsrfToken = getCookie('csrfToken');
  if (csrfToken !== storedCsrfToken) {
    throw new Error('Token CSRF inválido');
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function generateCsrfToken() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Add CSRF validation
        const csrfToken = document.querySelector('input[name="csrf-token"]').value;
        validateCsrfToken(csrfToken);
        
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
    } catch (error) {
        console.error('Erro na validação:', error);
        window.location.href = 'obrigado.html?status=error';
        return;
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
    // Generate and set CSRF token
    const csrfToken = generateCsrfToken();
    document.cookie = `csrfToken=${csrfToken}; path=/; SameSite=Strict`;
    
    // Set the CSRF token in the hidden input field
    const csrfInput = document.querySelector('input[name="csrf-token"]');
    if (csrfInput) {
        csrfInput.value = csrfToken;
    }

    const form = document.getElementById('myForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});





