// Funções de navegação do formulário
let currentContainer = 0;
let containers;

function startSurvey() {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('myForm').classList.remove('hidden');
    containers = document.querySelectorAll('.form-container');
    showContainer(0);
    updateNavigationButtons();
}

function showContainer(index) {
    // Validação do container atual antes de sair
    if (!validateCurrentContainer()) {
        return;
    }

    // Animação de transição
    containers.forEach(container => {
        container.style.display = 'none';
        container.style.transform = 'translateX(100%)';
        container.style.opacity = '0';
    });
    
    containers[index].style.display = 'flex';
    setTimeout(() => {
        containers[index].style.transform = 'translateX(0)';
        containers[index].style.opacity = '1';
    }, 50);
    
    currentContainer = index;
    updateNavigationButtons();
}

function validateCurrentContainer() {
    const current = containers[currentContainer];
    const requiredInputs = current.querySelectorAll('input[required], select[required]');
    
    for (const input of requiredInputs) {
        if (!input.value.trim()) {
            alert(`Por favor, preencha o campo "${input.name}"`);
            input.focus();
            return false;
        }
    }
    return true;
}

function updateNavigationButtons() {
    const prevButtons = document.querySelectorAll('button[onclick*="navigate(-1)"]');
    const nextButtons = document.querySelectorAll('button[onclick*="navigate(1)"]');
    
    // Atualizar botão anterior
    prevButtons.forEach(btn => {
        btn.disabled = currentContainer === 0;
    });
    
    // Atualizar botão próximo
    nextButtons.forEach(btn => {
        btn.disabled = currentContainer === containers.length - 1;
    });
}

function navigate(direction) {
    const newIndex = currentContainer + direction;
    if (newIndex >= 0 && newIndex < containers.length) {
        showContainer(newIndex);
    }
}

function autoNext() {
    if (currentContainer < containers.length - 1 && validateCurrentContainer()) {
        setTimeout(() => navigate(1), 500);
    }
}