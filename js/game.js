// js/game.js
document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // --- CONFIGURACIÓN DEL MAPA ---
    const TILE_SIZE = 16; // Tamaño de cada tile en píxeles (ej: 16x16)
    
    // Coordenadas del tile de AGUA dentro de tu tileset.png
    // sx (source x), sy (source y)
    const WATER_TILE_X = 80; // Posición X del tile de agua en el tileset
    const WATER_TILE_Y = 64; // Posición Y del tile de agua en el tileset


    // --- CARGA DEL TILESET ---
    const tileset = new Image();
    tileset.src = 'assets/tileset.png'; // Ruta a tu imagen

    // Función para dibujar el mapa
    function drawMap() {
        // Ajustamos el tamaño del canvas al de la ventana
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Calculamos cuántos tiles caben en la pantalla
        const cols = Math.ceil(canvas.width / TILE_SIZE);
        const rows = Math.ceil(canvas.height / TILE_SIZE);

        // Dibujamos el mapa tile por tile
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                
                // Usamos ctx.drawImage() para dibujar una porción del tileset
                // en una posición del canvas.
                ctx.drawImage(
                    tileset,        // La imagen fuente (tu tileset)
                    WATER_TILE_X,   // Coordenada X del tile de agua en el tileset
                    WATER_TILE_Y,   // Coordenada Y del tile de agua en el tileset
                    TILE_SIZE,      // Ancho del tile en el tileset
                    TILE_SIZE,      // Alto del tile en el tileset
                    col * TILE_SIZE,// Coordenada X donde dibujar en el canvas
                    row * TILE_SIZE,// Coordenada Y donde dibujar en el canvas
                    TILE_SIZE,      // Ancho del tile a dibujar en el canvas
                    TILE_SIZE       // Alto del tile a dibujar en el canvas
                );
            }
        }
    }

    // --- INICIO ---
    // Nos aseguramos de que la imagen del tileset se haya cargado completamente
    // antes de intentar dibujar el mapa.
    tileset.onload = () => {
        drawMap();
    };

    // Si el usuario cambia el tamaño de la ventana, volvemos a dibujar el mapa
    window.addEventListener('resize', drawMap);

});