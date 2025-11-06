document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const buttons = Array.from(document.querySelectorAll('.main-menu .menu-button'));
    const hoverSound = document.getElementById('hover-sound');
    const clickSound = document.getElementById('click-sound');
    const menuCursor = document.getElementById('menu-cursor');
    
    // Modales
    const optionsModal = document.getElementById('options-modal');
    const creditsModal = document.getElementById('credits-modal');
    
    // Controles de Opciones
    const optionToggles = Array.from(optionsModal.querySelectorAll('.toggle-btn'));
    
    // Botones de cerrar modales
    const closeButtons = document.querySelectorAll('.close-modal-btn');

    // --- ESTADO DEL JUEGO ---
    let mainMenuIndex = 0;
    let optionsMenuIndex = 0;
    let activeModal = 'none'; // 'none', 'options', 'credits'

    // --- FUNCIÓN PARA ABRIR Y CERRAR MODALES ---
    function openModal(modalId) {
        activeModal = modalId;
        if (modalId === 'options') optionsModal.style.display = 'flex';
        if (modalId === 'credits') creditsModal.style.display = 'flex';
        updateModalSelection();
    }

    function closeModal() {
        optionsModal.style.display = 'none';
        creditsModal.style.display = 'none';
        activeModal = 'none';
    }

    // --- ACTUALIZACIÓN DE INTERFAZ ---
    function updateMainMenuSelection(playSound = true) {
        if (playSound) {
            hoverSound.currentTime = 0;
            hoverSound.play().catch(e => {});
        }
        buttons.forEach((button, index) => {
            button.classList.toggle('active', index === mainMenuIndex);
        });
        const selectedButton = buttons[mainMenuIndex];
        const top = selectedButton.offsetTop;
        const left = selectedButton.offsetLeft - menuCursor.offsetWidth - 16;
        menuCursor.style.top = `${top}px`;
        menuCursor.style.left = `${left}px`;
    }
    
    function updateModalSelection() {
        if (activeModal === 'options') {
            optionToggles.forEach((btn, index) => {
                btn.classList.toggle('active', index === optionsMenuIndex);
            });
        }
    }

    // --- LÓGICA DE CONTROL ---
    window.addEventListener('keydown', (e) => {
        e.preventDefault();
        if (e.key === 'Escape') { closeModal(); return; }

        switch (activeModal) {
            case 'none': handleMainMenuInput(e.key); break;
            case 'options': handleOptionsInput(e.key); break;
            case 'credits': if (e.key === 'Enter') closeModal(); break;
        }
    });

    // --- MANEJADORES DE ENTRADA ---
    function handleMainMenuInput(key) {
        switch (key) {
            case 'ArrowUp':
                mainMenuIndex = (mainMenuIndex > 0) ? mainMenuIndex - 1 : buttons.length - 1;
                updateMainMenuSelection();
                break;
            case 'ArrowDown':
                mainMenuIndex = (mainMenuIndex < buttons.length - 1) ? mainMenuIndex + 1 : 0;
                updateMainMenuSelection();
                break;
            case 'Enter':
                clickSound.currentTime = 0;
                clickSound.play().catch(e => {});
                handleMenuAction(buttons[mainMenuIndex].dataset.action);
                break;
        }
    }
    
    function handleMenuAction(action) {
        setTimeout(() => {
            switch (action) {
                case 'new-game': alert('Iniciando...'); break;
                case 'load-game': alert('Cargando...'); break;
                case 'options': openModal('options'); break;
                case 'credits': openModal('credits'); break;
            }
        }, 150);
    }
    
    function handleOptionsInput(key) {
        const currentToggle = optionToggles[optionsMenuIndex];
        switch (key) {
            case 'ArrowUp':
                optionsMenuIndex = (optionsMenuIndex > 0) ? optionsMenuIndex - 1 : optionToggles.length - 1;
                updateModalSelection();
                break;
            case 'ArrowDown':
                optionsMenuIndex = (optionsMenuIndex < optionToggles.length - 1) ? optionsMenuIndex + 1 : 0;
                updateModalSelection();
                break;
            case 'Enter':
                toggleOption(currentToggle);
                break;
        }
    }

    function toggleOption(button) {
        const isToggled = button.dataset.toggled === 'true';
        button.dataset.toggled = !isToggled;
        button.textContent = !isToggled ? 'ON' : 'OFF';
        clickSound.currentTime = 0;
        clickSound.play().catch(e => {});
    }

    // --- EVENTOS TÁCTILES ---
    buttons.forEach((button, index) => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (mainMenuIndex !== index) {
                mainMenuIndex = index;
                updateMainMenuSelection();
            }
            clickSound.currentTime = 0;
            clickSound.play().catch(e => {});
            handleMenuAction(button.dataset.action);
        });
    });

    closeButtons.forEach(btn => btn.addEventListener('touchstart', e => { e.preventDefault(); closeModal(); }));
    
    optionToggles.forEach((btn, index) => {
        btn.addEventListener('touchstart', e => {
            e.preventDefault();
            optionsMenuIndex = index;
            toggleOption(btn);
        });
    });

    // --- INICIALIZACIÓN ---
    updateMainMenuSelection(false);
});