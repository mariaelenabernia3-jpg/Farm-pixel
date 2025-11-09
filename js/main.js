document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const buttons = Array.from(document.querySelectorAll('.main-menu .menu-button'));
    const hoverSound = document.getElementById('hover-sound');
    const clickSound = document.getElementById('click-sound');
    const menuCursor = document.getElementById('menu-cursor');
    const menuContainer = document.querySelector('.menu-container');
    const optionsModal = document.getElementById('options-modal');
    const creditsModal = document.getElementById('credits-modal');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const userIconButton = document.getElementById('user-icon-button');
    const userInfoDropdown = document.getElementById('user-info-dropdown');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const optionToggles = Array.from(optionsModal.querySelectorAll('.toggle-btn'));
    const closeButtons = document.querySelectorAll('.close-modal-btn');

    // --- ESTADO DEL JUEGO ---
    let mainMenuIndex = 0;
    let optionsMenuIndex = 0;
    let activeModal = 'none';
    let currentUser = localStorage.getItem('farmPixelUser') || null;

    // --- MANEJO DE MODALES ---
    function openModal(modalId) {
        activeModal = modalId;
        const modals = { 'options': optionsModal, 'credits': creditsModal, 'login': loginModal, 'register': registerModal };
        if (modals[modalId]) modals[modalId].style.display = 'flex';
        updateModalSelection();
    }
    function closeModal() {
        if (activeModal !== 'none') {
            const modals = { 'options': optionsModal, 'credits': creditsModal, 'login': loginModal, 'register': registerModal };
            if (modals[activeModal]) modals[activeModal].style.display = 'none';
            activeModal = 'none';
        }
        userInfoDropdown.classList.add('hidden');
    }

    // --- MANEJO DE LA INTERFAZ DE USUARIO ---
    function updateUserUI() {
        if (currentUser) {
            userInfoDropdown.querySelector('#welcome-message').textContent = `Usuario: ${currentUser}`;
        } else {
            userInfoDropdown.classList.add('hidden');
        }
    }

    // --- ACTUALIZACIÓN DE INTERFAZ DEL MENÚ ---
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
        if (e.key === 'Escape') { if (activeModal !== 'none') { e.preventDefault(); closeModal(); } return; }
        switch (activeModal) {
            case 'none': e.preventDefault(); handleMainMenuInput(e.key); break;
            case 'options': e.preventDefault(); handleOptionsInput(e.key); break;
            case 'credits': e.preventDefault(); if (e.key === 'Enter') closeModal(); break;
            case 'login': case 'register': break;
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
                clickSound.currentTime = 0; clickSound.play().catch(e => {});
                handleMenuAction(buttons[mainMenuIndex].dataset.action);
                break;
        }
    }
   function handleMenuAction(action) {
        setTimeout(() => {
            switch (action) {
                case 'play': 
                    window.location.href = 'game.html'; // <--- LÍNEA MODIFICADA
                    break;
                case 'options': openModal('options'); break;
                case 'credits': openModal('credits'); break;
            }
        }, 150);
    }
    function handleOptionsInput(key) {
        const currentToggle = optionToggles[optionsMenuIndex];
        switch (key) {
            case 'ArrowUp': case 'ArrowDown': optionsMenuIndex = (optionsMenuIndex === 0) ? 1 : 0; updateModalSelection(); break;
            case 'Enter': toggleOption(currentToggle); break;
        }
    }
    function toggleOption(button) {
        const isToggled = button.dataset.toggled === 'true';
        button.dataset.toggled = !isToggled;
        button.textContent = !isToggled ? 'ON' : 'OFF';
        clickSound.currentTime = 0; clickSound.play().catch(e => {});
		const optionName = button.dataset.option;
		localStorage.setItem(`farmPixelOption_${optionName}`, !isToggled);
    }

    // --- EVENTOS TÁCTILES Y DE RATÓN ---
    buttons.forEach((button, index) => {
        function selectButton() { if (mainMenuIndex !== index) { mainMenuIndex = index; updateMainMenuSelection(); } }
        function activateButton() { clickSound.currentTime = 0; clickSound.play().catch(e => {}); handleMenuAction(button.dataset.action); }
        button.addEventListener('mouseenter', selectButton);
        button.addEventListener('click', (e) => { e.preventDefault(); selectButton(); activateButton(); });
        button.addEventListener('touchstart', (e) => { e.preventDefault(); selectButton(); activateButton(); });
    });
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); closeModal(); });
    });
    optionToggles.forEach((btn, index) => {
        function activateToggle() { optionsMenuIndex = index; toggleOption(btn); }
        btn.addEventListener('click', (e) => { e.preventDefault(); activateToggle(); });
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); activateToggle(); });
    });

    // --- EFECTO PARALLAX ---
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

    // --- LÓGICA DE AUTENTICACIÓN ---
    userIconButton.addEventListener('click', (e) => {
        e.preventDefault(); clickSound.currentTime = 0; clickSound.play().catch(e => {});
        if (currentUser) {
            userInfoDropdown.classList.toggle('hidden');
        } else {
            openModal('login');
        }
    });
    switchToRegister.addEventListener('click', (e) => { e.preventDefault(); closeModal(); setTimeout(() => openModal('register'), 50); });
    switchToLogin.addEventListener('click', (e) => { e.preventDefault(); closeModal(); setTimeout(() => openModal('login'), 50); });
    loginForm.addEventListener('submit', (e) => {
		e.preventDefault(); const username = e.target.username.value;
		if (username) { 
			currentUser = username; 
			localStorage.setItem('farmPixelUser', currentUser); // <--- AÑADIMOS ESTA LÍNEA
			alert(`¡Bienvenido de vuelta, ${username}!`); 
			closeModal(); 
			updateUserUI(); 
		} else { 
			alert("Por favor, introduce un nombre de usuario."); 
		}
	});
    registerForm.addEventListener('submit', (e) => {
		e.preventDefault(); const username = e.target.username.value;
		if (username) { 
			currentUser = username; 
			localStorage.setItem('farmPixelUser', currentUser); // <--- AÑADIMOS ESTA LÍNEA
			alert(`¡Cuenta creada para ${username}! Has iniciado sesión.`); 
			closeModal(); 
			updateUserUI(); 
		} else { 
			alert("Por favor, introduce un nombre de usuario."); 
		}
	});
    document.getElementById('logout-link').addEventListener('click', (e) => {
		e.preventDefault(); 
		alert(`¡Hasta pronto, ${currentUser}!`); 
		currentUser = null; 
		localStorage.removeItem('farmPixelUser'); // <--- AÑADIMOS ESTA LÍNEA
		updateUserUI();
	});

    // --- SISTEMA DE PARTÍCULAS ---
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    class Particle { constructor(x,y,s,dX,dY){this.x=x;this.y=y;this.size=s;this.speedX=dX;this.speedY=dY;}draw(){ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillRect(this.x,this.y,this.size,this.size);}update(){this.x+=this.speedX;this.y+=this.speedY;if(this.y<0){this.y=canvas.height+this.size;this.x=Math.random()*canvas.width;}}}
    function initParticles(){particlesArray=[];const n=75;for(let i=0;i<n;i++){const s=Math.random()*2+1,x=Math.random()*canvas.width,y=Math.random()*canvas.height,dX=Math.random()*0.4-0.2,dY=-Math.random()*0.5-0.2;particlesArray.push(new Particle(x,y,s,dX,dY));}}
    function animateParticles(){ctx.clearRect(0,0,canvas.width,canvas.height);if(particlesArray)for(let i=0;i<particlesArray.length;i++){particlesArray[i].update();particlesArray[i].draw();}requestAnimationFrame(animateParticles);}
    initParticles();
    animateParticles();
    
    // --- INICIALIZACIÓN FINAL ---
	
	// Carga y aplica las opciones guardadas al iniciar.
	optionToggles.forEach(btn => {
		const optionName = btn.dataset.option;
		const savedValue = localStorage.getItem(`farmPixelOption_${optionName}`);
    
		// Por defecto, las opciones están en 'true' (ON) si no hay nada guardado.
		let isEnabled = true; 
		if (savedValue !== null) {
			isEnabled = (savedValue === 'true');
		}

		btn.dataset.toggled = isEnabled;
		btn.textContent = isEnabled ? 'ON' : 'OFF';
	});

    updateMainMenuSelection(false);
    updateUserUI();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });
});