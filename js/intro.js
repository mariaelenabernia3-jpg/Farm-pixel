window.onload = () => {
    // Referencias a las pantallas
    const dzmScreen = document.getElementById('dzm-screen');
    const clanhaterScreen = document.getElementById('clanhater-screen');
    const techScreen = document.getElementById('tech-screen');

    // Duraciones para cada pantalla en milisegundos
    const dzmDuration = 3000;
    const clanhaterDuration = 3000;
    const techDuration = 4000;

    // --- SECUENCIA PRINCIPAL DE LA INTRODUCCIÓN (SIN OPCIÓN DE OMITIR) ---

    // 1. Transición de DZM a ClanHater
    setTimeout(() => {
        dzmScreen.classList.remove('visible');
        dzmScreen.classList.add('hidden');
        clanhaterScreen.classList.remove('hidden');
        clanhaterScreen.classList.add('visible');
    }, dzmDuration);

    // 2. Transición de ClanHater a Tecnologías
    setTimeout(() => {
        clanhaterScreen.classList.remove('visible');
        clanhaterScreen.classList.add('hidden');
        techScreen.classList.remove('hidden');
        techScreen.classList.add('visible');
    }, dzmDuration + clanhaterDuration);

    // 3. Transición final de Tecnologías al menú del juego
    setTimeout(() => {
        // Inicia el desvanecimiento de salida
        document.body.style.opacity = 0;
        
        // Espera a que termine la animación de desvanecimiento antes de redirigir
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 500); // Este tiempo debe coincidir con la transición en el CSS
        
    }, dzmDuration + clanhaterDuration + techDuration);
};