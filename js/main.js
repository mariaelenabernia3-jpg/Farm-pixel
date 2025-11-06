document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const buttons = Array.from(document.querySelectorAll('.main-menu .menu-button'));
    const hoverSound = document.getElementById('hover-sound');
    const clickSound = document.getElementById('click-sound');
    const menuCursor = document.getElementById('menu-cursor');
    const menuContainer = document.querySelector('.menu-container');
    const optionsModal = document.getElementById('options-modal');
    const creditsModal = document.getElementById('credits-modal');
    const optionToggles = Array.from(optionsModal.querySelectorAll('.toggle-btn'));
    const closeButtons = document.querySelectorAll('.close-modal-btn');

    // --- ESTADO DEL JUEGO ---
    let mainMenuIndex = 0;
    let optionsMenuIndex = 0;
    let activeModal = 'none';

    // --- MANEJO DE MODALES ---
    function openModal(modalId) {
        activeModal = modalId;
        if (modalId === 'options') {
            optionsModal.style.display = 'flex';
        } else if (modalId === 'credits') {
            creditsModal.style.display = 'flex';
        }
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
        const left = selectedButton.offsetLeft - menuCursor.offsetWidth - 20;
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

    // --- LÓGICA DE CONTROL POR TECLADO ---
    window.addEventListener('keydown', (e) => {
        e.preventDefault();
        if (e.key === 'Escape') { if(activeModal !== 'none') closeModal(); return; }

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
            case 'ArrowUp': case 'ArrowDown':
                optionsMenuIndex = (optionsMenuIndex === 0) ? 1 : 0;
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

    // --- EFECTO PARALLAX CON EL RATÓN ---
    const parallaxStrength = 20;
    window.addEventListener('mousemove', (e) => {
        if (activeModal === 'none') {
            const { innerWidth: width, innerHeight: height } = window;
            const { clientX: mouseX, clientY: mouseY } = e;
            const x = (mouseX / width) - 0.5;
            const y = (mouseY / height) - 0.5;
            const offsetX = -x * parallaxStrength;
            const offsetY = -y * parallaxStrength;
            menuContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
    });

    // --- INICIALIZACIÓN DEL MENÚ ---
    updateMainMenuSelection(false);

    // --- SISTEMA DE PARTÍCULAS FLOTANTES ---
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    class Particle { constructor(x, y, size, speedX, speedY){this.x=x;this.y=y;this.size=size;this.speedX=speedX;this.speedY=speedY;}draw(){ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillRect(this.x,this.y,this.size,this.size);}update(){this.x+=this.speedX;this.y+=this.speedY;if(this.y<0){this.y=canvas.height+this.size;this.x=Math.random()*canvas.width;}}}
    function initParticles() { particlesArray=[];const n=75;for(let i=0;i<n;i++){const s=Math.random()*2+1,x=Math.random()*canvas.width,y=Math.random()*canvas.height,dX=Math.random()*0.4-0.2,dY=-Math.random()*0.5-0.2;particlesArray.push(new Particle(x,y,s,dX,dY));}}
    function animateParticles() { ctx.clearRect(0,0,canvas.width,canvas.height);if(particlesArray){for(let i=0;i<particlesArray.length;i++){particlesArray[i].update();particlesArray[i].draw();}}requestAnimationFrame(animateParticles);}
    initParticles();
    animateParticles();
    
    // --- INICIALIZACIÓN FINAL ---
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });
});