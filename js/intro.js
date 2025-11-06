window.onload = () => {
    // Referencias a las pantallas
    const dzmScreen = document.getElementById('dzm-screen');
    const clanhaterScreen = document.getElementById('clanhater-screen');
    const techScreen = document.getElementById('tech-screen');

    // Duraciones ajustadas para un ritmo retro y rápido
    const dzmDuration = 3000;       // 3 segundos
    const clanhaterDuration = 3000; // 3 segundos
    const techDuration = 4000;      // 4 segundos

    // --- SECUENCIA DE LA INTRO ---

    // 1. Después de DZM, muestra ClanHater.
    setTimeout(() => {
        dzmScreen.classList.remove('visible');
        dzmScreen.classList.add('hidden');
        
        clanhaterScreen.classList.remove('hidden');
        clanhaterScreen.classList.add('visible');
    }, dzmDuration);

    // 2. Después de ClanHater, muestra las Tecnologías.
    setTimeout(() => {
        clanhaterScreen.classList.remove('visible');
        clanhaterScreen.classList.add('hidden');
        
        techScreen.classList.remove('hidden');
        techScreen.classList.add('visible');
    }, dzmDuration + clanhaterDuration);

    // 3. Después de las Tecnologías, inicia la transición al menú del juego.
    setTimeout(() => {
        // Inicia el fade-out del cuerpo de la página
        document.body.style.opacity = 0;
        
        // Espera a que termine el fade-out antes de redirigir
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 500); // Este tiempo debe coincidir con la transición en el CSS del body

    }, dzmDuration + clanhaterDuration + techDuration);
};