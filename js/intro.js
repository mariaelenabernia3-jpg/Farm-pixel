window.onload = () => {
    // Referencias a las pantallas y elementos
    const dzmScreen = document.getElementById('dzm-screen');
    const clanhaterScreen = document.getElementById('clanhater-screen');
    const techScreen = document.getElementById('tech-screen');
    const skipPrompt = document.getElementById('skip-prompt');

    // Duraciones para cada pantalla en milisegundos
    const dzmDuration = 3000;
    const clanhaterDuration = 3000;
    const techDuration = 4000;

    // Banderas para controlar el estado
    let isSkipping = false;
    // Array para almacenar los IDs de los timeouts y poder cancelarlos si se omite la intro
    const timeoutIds = [];

    // --- FUNCIÓN PARA OMITIR LA INTRODUCCIÓN ---
    function skipIntro() {
        // Si ya estamos omitiendo, no hagas nada más
        if (isSkipping) return;
        isSkipping = true;

        console.log("Intro omitida.");

        // Cancela todas las animaciones de la secuencia que estén pendientes
        timeoutIds.forEach(id => clearTimeout(id));

        // Oculta el texto de "omitir" inmediatamente
        skipPrompt.classList.add('hidden');

        // Inicia la transición final al menú
        document.body.style.opacity = 0;
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 500); // Este tiempo debe coincidir con la transición en el CSS
    }

    // --- SECUENCIA PRINCIPAL DE LA INTRODUCCIÓN ---
    function startIntroSequence() {
        // Muestra el texto de "omitir" después de un breve momento
        timeoutIds.push(setTimeout(() => {
            skipPrompt.classList.remove('hidden');
        }, 500));

        // 1. Transición de DZM a ClanHater
        timeoutIds.push(setTimeout(() => {
            dzmScreen.classList.remove('visible');
            dzmScreen.classList.add('hidden');
            clanhaterScreen.classList.remove('hidden');
            clanhaterScreen.classList.add('visible');
        }, dzmDuration));

        // 2. Transición de ClanHater a Tecnologías
        timeoutIds.push(setTimeout(() => {
            clanhaterScreen.classList.remove('visible');
            clanhaterScreen.classList.add('hidden');
            techScreen.classList.remove('hidden');
            techScreen.classList.add('visible');
        }, dzmDuration + clanhaterDuration));

        // 3. Transición final de Tecnologías al menú del juego
        timeoutIds.push(setTimeout(() => {
            skipPrompt.classList.add('hidden'); // Oculta el texto antes de la transición final
            skipIntro(); // Llama a la función skip para la transición final
        }, dzmDuration + clanhaterDuration + techDuration));
    }

    // --- INICIALIZACIÓN ---
    // Inicia la secuencia de introducción automáticamente al cargar la página
    startIntroSequence();

    // Añade el listener para la tecla "Escape" para poder omitir la intro
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            skipIntro();
        }
    });
};