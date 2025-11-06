window.onload = () => {
    // Referencias a las pantallas
    const splashScreen = document.getElementById('splash-screen');
    const techScreen = document.getElementById('tech-screen');

    // Duraciones ajustadas para un ritmo retro
    const logoDuration = 3500; // 3.5 segundos
    const techDuration = 4000; // 4 segundos

    // --- SECUENCIA DE LA INTRO ---

    // 1. Después de que el logo se muestre, cambia a la pantalla de tecnologías.
    setTimeout(() => {
        splashScreen.classList.remove('visible');
        splashScreen.classList.add('hidden');
        techScreen.classList.remove('hidden');
        techScreen.classList.add('visible');
    }, logoDuration);

    // 2. Después de que la pantalla de tecnologías se muestre, inicia la transición al menú.
    setTimeout(() => {
        // Inicia el fade-out del cuerpo de la página
        document.body.style.opacity = 0;
        
        // Espera a que termine el fade-out antes de redirigir
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 500); // Este tiempo debe coincidir con la transición en el CSS del body

    }, logoDuration + techDuration);
};