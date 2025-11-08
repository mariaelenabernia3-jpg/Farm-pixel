/* =================================================== */
/*     js/game.js (Con Compra de Parcelas y Cosecha)   */
/* =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const PLOT_COST = 500;

    const CROP_DATA = {
        carrot: {
            cost: 10,
            sellValue: 25,
            stages: [
                { duration: 10 * 1000, spriteClass: 'plot-carrot-stage-0' },
                { duration: 20 * 1000, spriteClass: 'plot-carrot-stage-1' },
                { duration: 30 * 1000, spriteClass: 'plot-carrot-stage-2' },
                { duration: 40 * 1000, spriteClass: 'plot-carrot-stage-3' }
            ]
        }
    };

    const gameState = {
        money: 100,
        inventory: { carrotSeeds: 0 },
        currentSelection: null,
        plots: {
            1: { isLocked: false, crop: null, plantedAt: 0 },
            2: { isLocked: true, crop: null, plantedAt: 0 },
            3: { isLocked: true, crop: null, plantedAt: 0 },
            4: { isLocked: true, crop: null, plantedAt: 0 },
        }
    };

    const moneyDisplay = document.getElementById('money-display');
    const carrotSeedsDisplay = document.getElementById('carrot-seeds-display');
    const plotElements = document.querySelectorAll('.plot');
    const plantButton = document.querySelector('.action-button[data-action="plant"]');
    const harvestButton = document.querySelector('.action-button[data-action="harvest"]');
    const shopButton = document.querySelector('.action-button[data-action="shop"]');
    const shopModal = document.getElementById('shop-modal');
    const closeShopButton = document.getElementById('close-shop-button');
    const buyCarrotButton = document.querySelector('.modal-button[data-action="buy-carrot"]');

    const ALL_CROP_CLASSES = ['plot-empty', 'plot-carrot-stage-0', 'plot-carrot-stage-1', 'plot-carrot-stage-2', 'plot-carrot-stage-3'];

    function formatTime(ms) {
        if (ms <= 0) return "¡Listo!";
        const seconds = Math.ceil(ms / 1000);
        return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }

    function updateUI() {
        moneyDisplay.textContent = gameState.money;
        carrotSeedsDisplay.textContent = gameState.inventory.carrotSeeds;

        plotElements.forEach(plotEl => {
            const plotId = plotEl.dataset.plotId;
            const plotState = gameState.plots[plotId];
            const plotTimerEl = plotEl.querySelector('.plot-timer');
            const plotBuyOverlayEl = plotEl.querySelector('.plot-buy-overlay');

            plotEl.classList.remove(...ALL_CROP_CLASSES, 'plot-locked');
            plotTimerEl.classList.add('hidden');
            plotBuyOverlayEl.classList.add('hidden');

            if (plotState.isLocked) {
                plotEl.classList.add('plot-locked');
                plotBuyOverlayEl.innerHTML = `<span>${PLOT_COST} 🪙</span>`;
                plotBuyOverlayEl.classList.remove('hidden');
            } else if (plotState.crop) {
                const cropData = CROP_DATA[plotState.crop];
                const stages = cropData.stages;
                const totalGrowthTime = stages[stages.length - 1].duration;
                const elapsedTime = Date.now() - plotState.plantedAt;
                
                let currentStage = stages[0];
                for (const stage of stages) {
                    if (elapsedTime >= stage.duration) { currentStage = stage; } else { break; }
                }
                plotEl.classList.add(currentStage.spriteClass);
                
                const remainingTime = totalGrowthTime - elapsedTime;
                plotTimerEl.textContent = formatTime(remainingTime);
                plotTimerEl.classList.remove('hidden');
            } else {
                plotEl.classList.add('plot-empty');
            }
        });
        
        plantButton.classList.toggle('active', gameState.currentSelection === 'plant');
        harvestButton.classList.toggle('active', gameState.currentSelection === 'harvest');
    }

    shopButton.addEventListener('click', () => shopModal.classList.remove('hidden'));
    closeShopButton.addEventListener('click', () => shopModal.classList.add('hidden'));

    buyCarrotButton.addEventListener('click', () => {
        const cost = CROP_DATA.carrot.cost;
        if (gameState.money >= cost) {
            gameState.money -= cost;
            gameState.inventory.carrotSeeds++;
            updateUI();
        } else {
            alert("¡No tienes suficiente dinero!");
        }
    });

    plantButton.addEventListener('click', () => {
        gameState.currentSelection = (gameState.currentSelection === 'plant') ? null : 'plant';
        updateUI();
    });

    harvestButton.addEventListener('click', () => {
        gameState.currentSelection = (gameState.currentSelection === 'harvest') ? null : 'harvest';
        updateUI();
    });

    plotElements.forEach(plotEl => {
        plotEl.addEventListener('click', () => {
            const plotId = plotEl.dataset.plotId;
            const plotState = gameState.plots[plotId];

            if (plotState.isLocked) {
                if (gameState.money >= PLOT_COST) {
                    if (confirm(`¿Quieres comprar esta parcela por ${PLOT_COST} monedas?`)) {
                        gameState.money -= PLOT_COST;
                        plotState.isLocked = false;
                    }
                } else {
                    alert("¡No tienes suficiente dinero para comprar esta parcela!");
                }
                gameState.currentSelection = null;
                updateUI();
                return;
            }

            if (gameState.currentSelection === 'plant') {
                if (plotState.crop === null && gameState.inventory.carrotSeeds > 0) {
                    gameState.inventory.carrotSeeds--;
                    plotState.crop = 'carrot';
                    plotState.plantedAt = Date.now();
                } else if (gameState.inventory.carrotSeeds <= 0) {
                    alert("¡No tienes semillas! Cómpralas en la tienda.");
                }
            } else if (gameState.currentSelection === 'harvest') {
                if (plotState.crop) {
                    const cropData = CROP_DATA[plotState.crop];
                    const totalGrowthTime = cropData.stages[cropData.stages.length - 1].duration;
                    const elapsedTime = Date.now() - plotState.plantedAt;
                    
                    if (elapsedTime >= totalGrowthTime) {
                        gameState.money += cropData.sellValue;
                        plotState.crop = null;
                        plotState.plantedAt = 0;
                    } else {
                        alert("¡Aún no está listo para cosechar!");
                    }
                }
            }
            
            gameState.currentSelection = null;
            updateUI();
        });
    });

    function gameLoop() {
        updateUI();
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
});