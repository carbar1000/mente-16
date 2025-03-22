function generateCsrfToken() {
    const csrfToken = crypto.randomUUID();
    document.cookie = `csrfToken=${csrfToken}; path=/; secure; sameSite=strict`;
    return csrfToken;
}

function initializeForm() {
    const csrfToken = generateCsrfToken();
    
    // Add hidden input for CSRF token if it doesn't exist
    let csrfInput = document.getElementById('csrf_token');
    if (!csrfInput) {
        csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.id = 'csrf_token';
        csrfInput.name = 'csrf_token';
        document.getElementById('myForm').appendChild(csrfInput);
    }
    
    csrfInput.value = csrfToken;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function validateCsrfToken(token) {
    return token && typeof token === 'string' && token.length === 36;
}

// Simplificar o formState
const formState = {
    currentSection: 0,
    isSubmitting: false,
    hasErrors: false
};

// Add error handling wrapper
function errorHandler(fn) {
    return async function(...args) {
        try {
            formState.isSubmitting = true;
            await fn.apply(this, args);
        } catch (error) {
            console.error('Operation failed:', error);
            showFlashMessage('Ocorreu um erro inesperado', 'error');
        } finally {
            formState.isSubmitting = false;
        }
    };
}

// Improved form validation
function validateForm() {
    formState.hasErrors = false;
    const errors = [];

    // Validação de campos obrigatórios
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    for (const input of requiredInputs) {
        if (!input.value.trim()) {
            showFlashMessage(`Por favor, preencha o campo "${input.name}"`, 'error');
            input.focus();
            return false;
        }

        // Validação do formato do nome
        if (input.id === 'nome') {
            if (!/^[A-Za-z\s]+$/.test(input.value.trim())) {
                showFlashMessage('Nome deve conter apenas letras', 'error');
                input.focus();
                return false;
            }
        }

        // Validação do formato do email
        if (input.id === 'email') {
            if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(input.value.trim())) {
                showFlashMessage('Email inválido', 'error');
                input.focus();
                return false;
            }
        }
    }

    // Validação dos botões de rádio
    const sections = ['A', 'B', 'C'];
    for (const section of sections) {
        const radioButtons = document.querySelectorAll(`input[name="${section}"]`);
        const isChecked = Array.from(radioButtons).some(radio => radio.checked);
        if (!isChecked) {
            showFlashMessage(`Por favor, selecione uma opção para a seção ${section}`, 'error');
            return false;
        }
    }

    // Add additional validations
    const phoneInput = document.getElementById('telefone');
    if (phoneInput && phoneInput.value) {
        if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phoneInput.value)) {
            errors.push('Formato de telefone inválido. Use (99) 99999-9999');
        }
    }

    // Check for duplicate submissions
    if (formState.isSubmitting) {
        errors.push('Formulário já está sendo enviado');
    }

    if (errors.length > 0) {
        formState.hasErrors = true;
        errors.forEach(error => showFlashMessage(error, 'error'));
        return false;
    }

    return true;
}

// Enhanced flash message system
function showFlashMessage(message, type, duration = 3000) {
    const flashMessageDiv = document.getElementById('flashMessage');
    if (!flashMessageDiv) {
        console.error('Flash message element not found');
        return;
    }

    // Remove existing messages
    while (flashMessageDiv.firstChild) {
        flashMessageDiv.removeChild(flashMessageDiv.firstChild);
    }

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = `flash-message ${type}`;
    flashMessageDiv.appendChild(messageElement);
    flashMessageDiv.classList.remove('hidden');

    setTimeout(() => {
        messageElement.classList.add('fade-out');
        setTimeout(() => {
            flashMessageDiv.removeChild(messageElement);
            if (!flashMessageDiv.firstChild) {
                flashMessageDiv.classList.add('hidden');
            }
        }, 300);
    }, duration);
}

// Função para enviar dados para o Supabase
async function submitToSupabase(formData) {
    const { data, error } = await supabase
        .from('respostas')
        .insert([{
            nome: formData.get('Nome'),
            email: formData.get('Email'),
            secao_a: formData.get('A'),
            secao_b: formData.get('B'),
            secao_c: formData.get('C'),
            csrf_token: formData.get('csrf_token'),
            data_envio: new Date().toISOString()
        }]);

    if (error) {
        console.error('Erro Supabase:', error);
        throw new Error('Erro ao enviar para Supabase');
    }
    return data;
}

// Handler unificado para envio do formulário
const handleFormSubmit = errorHandler(async function(event) {
    event.preventDefault();
    
    const csrfToken = getCookie('csrfToken');
    if (!validateCsrfToken(csrfToken)) {
        showFlashMessage('Token de segurança inválido', 'error');
        return;
    }
    
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(event.target);
    
    try {
        // Enviar para Supabase
        await submitToSupabase(formData);
        
        // Enviar para Google Sheets
        const scriptUrl = window.env.GOOGLE_SCRIPT_URL;
        const values = [
            formData.get('Nome'),
            formData.get('Email'),
            formData.get('A'),
            formData.get('B'),
            formData.get('C'),
            csrfToken,
            new Date().toLocaleString()
        ];
        
        const response = await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({ values, csrfToken })
        });

        showFlashMessage('Resposta enviada com sucesso!', 'success');
    } catch (error) {
        showFlashMessage('Erro ao enviar resposta', 'error');
        console.error('Erro no envio:', error);
    }
});

// Funções de limpeza e inicialização
function cleanupForm() {
    formState.currentSection = 0;
    formState.isSubmitting = false;
    formState.hasErrors = false;
    
    const form = document.getElementById('myForm');
    if (form) {
        form.removeEventListener('submit', handleFormSubmit);
    }
}

function startSurvey() {
    cleanupForm();
    const intro = document.getElementById('intro');
    const form = document.getElementById('myForm');
    
    if (intro && form) {
        intro.classList.add('hidden');
        form.classList.remove('hidden');
        initializeForm();
        form.addEventListener('submit', handleFormSubmit);
    }
}

function autoNext() {
    const currentContainer = document.querySelector('.form-container.active');
    if (currentContainer) {
        const nextButton = currentContainer.querySelector('button[onclick="navigate(1)"]');
        if (nextButton) {
            setTimeout(() => {
                nextButton.click();
            }, 500);
        }
    }
}

// Função de navegação
function navigate(direction) {
    const currentSection = formState.currentSection + direction;
    const sections = document.querySelectorAll('.form-container');
    if (currentSection >= 0 && currentSection < sections.length) {
        formState.currentSection = currentSection;
        updateNavigationUI(sections);
    }
}

// Atualização da UI de navegação
function updateNavigationUI(sections) {
    sections.forEach((section, index) => {
        section.classList.toggle('active', index === formState.currentSection);
    });
    
    const prevButton = document.querySelector('button[onclick="navigate(-1)"]');
    if (prevButton) {
        prevButton.disabled = formState.currentSection === 0;
    }
}

// Export necessary functions
window.startSurvey = startSurvey;
window.navigate = navigate;
window.validateForm = validateForm;
window.showFlashMessage = showFlashMessage;
window.autoNext = autoNext;