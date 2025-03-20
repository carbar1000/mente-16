function generateCSRFToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function initializeForm() {
    const csrfToken = generateCSRFToken();
    document.getElementById('csrf_token').value = csrfToken;
}

// UI Navigation Functions
function startSurvey() {
    const intro = document.getElementById('intro');
    const form = document.getElementById('myForm');
    
    if (intro && form) {
        intro.classList.add('hidden');
        form.classList.remove('hidden');
        initializeForm(); // Initialize the form with CSRF token
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

// Função de validação do formulário
function validateForm() {
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

    return true;
}

// Função para exibir mensagens de feedback
function showFlashMessage(message, type) {
    const flashMessageDiv = document.getElementById('flashMessage');
    flashMessageDiv.textContent = message;
    flashMessageDiv.className = type; // 'error' ou 'success'
    flashMessageDiv.classList.remove('hidden');
    setTimeout(() => {
        flashMessageDiv.classList.add('hidden');
    }, 3000);
}

// Make functions available globally
window.startSurvey = startSurvey;
window.autoNext = autoNext;
window.validateForm = validateForm;
window.showFlashMessage = showFlashMessage;
