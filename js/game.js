/* =================================================== */
/*     js/game.js (Con Compra de Parcelas y Cosecha)   */
/* =================================================== */

document.addEventListener('DOMContentLoaded', () => {
	
	// Esta función nos da el estado inicial para un jugador nuevo.
    function getInitialState() {
		return {
			// --- SECCIÓN DEL JUGADOR ---
			player: {
				money: GAME_DATA.CONFIG.PLAYER_STARTING_MONEY,
				level: 1,
				xp: 0,  
				energy: GAME_DATA.CONFIG.MAX_ENERGY,
				lastUpdate: Date.now(),
				dailyRewardLastClaimed: null,
				talentPoints: 0,
				unlockedTalents: {},
				skills: {
					farming: { level: 1, xp: 0 }
				}
			},

			// --- SECCIÓN DE INVENTARIO ---
			inventory: {},
        
			// --- SECCIÓN DE PROGRESO DEL MUNDO ---
			plots: {
				1: { isLocked: false, crop: null, plantedAt: 0 },
				2: { isLocked: true, crop: null, plantedAt: 0 },
				3: { isLocked: true, crop: null, plantedAt: 0 },
				4: { isLocked: true, crop: null, plantedAt: 0 },
			},
			
			// --- SECCIÓN DE MISIONES ---
			quests: {
				lastGeneratedDate: null, 
				active: [] // Ej: ['collect_carrots_1', 'need_flour_1']
			},
        
			// --- ESTADO DE LA UI ---
			currentSelection: null,
		};
	}

    // Guarda el estado actual del juego en el localStorage del navegador.
    function saveGameState() {
		gameState.player.lastUpdate = Date.now();
        localStorage.setItem('farmPixelGameState', JSON.stringify(gameState));
    }

    // Carga el estado del juego. Si no existe, crea uno nuevo.
    function loadGameState() {
		const savedStateJSON = localStorage.getItem('farmPixelGameState');
		if (savedStateJSON) {
			return JSON.parse(savedStateJSON);
		} else {
			return getInitialState();
		}
	}

    let gameState;
	gameState = loadGameState();
	processOfflineProgress();
	saveGameState();
	
	// Añade una cantidad específica de un item al inventario del jugador.
	function addToInventory(itemId, quantity) {
		// Comprueba si el jugador ya tiene este item en su inventario
		if (!gameState.inventory[itemId]) {
			// Si no lo tiene, inicializa la cantidad en 0
			gameState.inventory[itemId] = 0;
		}
		// Añade la cantidad especificada
		gameState.inventory[itemId] += quantity;
		console.log(`Añadido ${quantity} de ${itemId} al inventario.`);
	}
	
	// Elimina una cantidad específica de un item del inventario.
	function removeFromInventory(itemId, quantity) {
		// Primero, verificamos si tenemos suficientes items para eliminar
		if (!hasInInventory(itemId, quantity)) {
			console.error(`Intento de eliminar ${quantity} de ${itemId}, pero no hay suficientes.`);
			return false;
		}
		gameState.inventory[itemId] -= quantity;
		if (gameState.inventory[itemId] <= 0) {
			delete gameState.inventory[itemId];
		}
		console.log(`Eliminado ${quantity} de ${itemId} del inventario.`);
		return true;
	}

	// Comprueba si el jugador tiene al menos una cantidad específica de un item.
	function hasInInventory(itemId, quantity) {
		return gameState.inventory[itemId] && gameState.inventory[itemId] >= quantity;
	}
	
	// Intenta craftear un item basado en una receta de GAME_DATA.
	function craftItem(recipeId) {
		const recipe = GAME_DATA.CRAFTING_RECIPES[recipeId];
		if (!recipe) {
			console.error(`La receta "${recipeId}" no existe.`);
			return;
		}

		for (const ingredient of recipe.ingredients) {
			if (!hasInInventory(ingredient.itemId, ingredient.quantity)) {
				// Si falta al menos un ingrediente, no se puede craftear
				alert(`No tienes suficientes recursos. Necesitas ${ingredient.quantity} de ${GAME_DATA.ITEMS[ingredient.itemId].name}.`);
				return; // Detenemos la función
			}
		}

		for (const ingredient of recipe.ingredients) {
			removeFromInventory(ingredient.itemId, ingredient.quantity);
		}
		
		addToInventory(recipe.output.itemId, recipe.output.quantity);
		alert(`¡Has creado 1 ${GAME_DATA.ITEMS[recipe.output.itemId].name}!`);
		saveGameState();
		updateUI();
	}
	
	function addXp(amount) {
		if (!amount || amount <= 0) return;
		gameState.player.xp += amount;
		console.log(`Ganas ${amount} de XP de Jugador.`);

		let requiredXp = GAME_DATA.CONFIG.XP_FOR_LEVEL[gameState.player.level];
    
		while (requiredXp && gameState.player.xp >= requiredXp) {
			gameState.player.level++;
			gameState.player.xp -= requiredXp;
        
			gameState.player.talentPoints++;
        
			gameState.player.energy = GAME_DATA.CONFIG.MAX_ENERGY;

			alert(`¡Has subido al Nivel ${gameState.player.level}!\n\nRecibes 1 Punto de Talento.\nTu energía ha sido restaurada.`);
        
			requiredXp = GAME_DATA.CONFIG.XP_FOR_LEVEL[gameState.player.level];
		}
	}
	
	function addSkillXp(skillName, amount) {
		if (!amount || amount <= 0 || !gameState.player.skills[skillName]) return;

		const skill = gameState.player.skills[skillName];
		skill.xp += amount;
		console.log(`Ganas ${amount} de XP en la habilidad ${skillName}.`);

		let requiredXp = GAME_DATA.CONFIG.SKILL_XP_FOR_LEVEL[skill.level];

		while (requiredXp && skill.xp >= requiredXp) {
        
			if (skill.level >= gameState.player.level) {
				skill.xp = requiredXp - 1; 
				console.log(`Nivel de habilidad ${skillName} limitado por el nivel del jugador.`);
				break;
			}

			skill.level++;
			skill.xp -= requiredXp;
        
			console.log(`¡Habilidad ${skillName} ha alcanzado el nivel ${skill.level}!`);
			alert(`¡Tu habilidad de Granjero ha alcanzado el nivel ${skill.level}!`);
        
			requiredXp = GAME_DATA.CONFIG.SKILL_XP_FOR_LEVEL[skill.level];
		}
	}
	
	function populateSkillsModal() {
		skillsContainer.innerHTML = '';

		for (const skillName in gameState.player.skills) {
			const skill = gameState.player.skills[skillName];
			const skillData = GAME_DATA.SKILLS_DATA[skillName]; // Obtenemos los datos de desbloqueo
        
			const skillElement = document.createElement('div');
			skillElement.className = 'skill-entry';

			const requiredXp = GAME_DATA.CONFIG.SKILL_XP_FOR_LEVEL[skill.level] || skill.xp;
			const xpPercentage = requiredXp > 0 ? (skill.xp / requiredXp) * 100 : 100;
			const displayName = skillName.charAt(0).toUpperCase() + skillName.slice(1);

			let unlocksHtml = '<div class="skill-unlocks-container">';
			let nextUnlockLevel = null;

			if (skillData && skillData.unlocks) {
				const unlockLevels = Object.keys(skillData.unlocks).sort((a, b) => a - b);

				unlockLevels.forEach(level => {
					const itemId = skillData.unlocks[level];
					const itemData = GAME_DATA.ITEMS[itemId];
                
					if (skill.level >= level) {
						unlocksHtml += `<div class="skill-unlock unlocked">✓ Nivel ${level}: ${itemData.name}</div>`;
					} else {
						unlocksHtml += `<div class="skill-unlock locked">🔒 Nivel ${level}: ${itemData.name}</div>`;
						if (nextUnlockLevel === null) {
							nextUnlockLevel = level;
						}
					}
				});
			}
			unlocksHtml += '</div>';

			skillElement.innerHTML = `
				<div class="skill-header">
					<span class="skill-name">${displayName} - Nivel ${skill.level}</span>
					${nextUnlockLevel ? `<span class="skill-next-unlock">Próximo en Nvl ${nextUnlockLevel}</span>` : '<span class="skill-next-unlock">¡Nivel Máximo!</span>'}
				</div>
				<div class="xp-bar-background skill-xp-bar">
					<div class="xp-bar-fill" style="width: ${xpPercentage}%;"></div>
					<span class="xp-text">${Math.floor(skill.xp)} / ${requiredXp}</span>
				</div>
				<h4>Desbloqueos:</h4>
				${unlocksHtml}
			`;

			skillsContainer.appendChild(skillElement);
		}
	}
	
	function getCurrentDateString() {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-11
		const day = String(today.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function checkAndGenerateDailyQuests() {
		const currentDate = getCurrentDateString();
		const lastGenerated = gameState.quests.lastGeneratedDate;

		if (currentDate !== lastGenerated) {
			console.log("Nuevo día detectado. Generando nuevas misiones diarias...");
        
			const allQuestIds = Object.keys(GAME_DATA.QUESTS);
			const shuffledQuests = allQuestIds.sort(() => 0.5 - Math.random());
			const newQuests = shuffledQuests.slice(0, 2); 
        
			gameState.quests.active = newQuests;
			gameState.quests.lastGeneratedDate = currentDate;
		} else {
			console.log("Misiones diarias ya generadas para hoy.");
		}
	}
	
	function processOfflineProgress() {
		const now = Date.now();
		const lastUpdate = gameState.player.lastUpdate || now;
		const secondsPassed = (now - lastUpdate) / 1000;

		const regenBonus = getTalentBonus('ENERGY_REGEN_INCREASE');
		const modifiedRegenRate = GAME_DATA.CONFIG.ENERGY_REGEN_RATE_PER_SECOND * (1 + regenBonus);
		const energyGained = secondsPassed * modifiedRegenRate;

		if (energyGained > 0) {
			gameState.player.energy += energyGained;
		}
		if (gameState.player.energy > GAME_DATA.CONFIG.MAX_ENERGY) {
			gameState.player.energy = GAME_DATA.CONFIG.MAX_ENERGY;
		}

		checkAndGenerateDailyQuests();
    
		setTimeout(checkDailyReward, 500);
	}
	
	function completeQuest(questId) {
		const questData = GAME_DATA.QUESTS[questId];
		if (!questData) {
			console.error(`Intento de completar una misión inválida: ${questId}`);
			return;
		}

		for (const req of questData.requirements) {
			if (!hasInInventory(req.itemId, req.quantity)) {
				alert("¡Oh, no! Parece que ya no tienes los recursos necesarios.");
				populateQuestsModal();
				return;
			}
		}

		console.log(`Completando misión: ${questData.title}`);
		for (const req of questData.requirements) {
			removeFromInventory(req.itemId, req.quantity);
		}

		if (questData.rewards.money) {
			gameState.player.money += questData.rewards.money;
			console.log(`Recibes ${questData.rewards.money} monedas.`);
		}
		if (questData.rewards.playerXp) {
			addXp(questData.rewards.playerXp); 
		}

		gameState.quests.active = gameState.quests.active.filter(id => id !== questId);

		saveGameState();
		updateUI();
		populateQuestsModal();
    
		alert(`¡Misión completada!\nHas entregado los recursos y recibido tus recompensas.`);
	}
	
	function checkDailyReward() {
		const currentDate = getCurrentDateString();
		if (gameState.player.dailyRewardLastClaimed !== currentDate) {
			todaysReward = selectDailyReward();
			if (!todaysReward) return;
			dailyRewardText.textContent = todaysReward.text;
			dailyRewardModal.classList.remove('hidden');
		}
	}

	function claimDailyReward() {
		const currentDate = getCurrentDateString();
		if (!todaysReward || gameState.player.dailyRewardLastClaimed === currentDate) return;

		switch (todaysReward.type) {
			case 'money':
				gameState.player.money += todaysReward.value;
				break;
			case 'energy':
				gameState.player.energy += todaysReward.value;
				if (gameState.player.energy > GAME_DATA.CONFIG.MAX_ENERGY) {
					gameState.player.energy = GAME_DATA.CONFIG.MAX_ENERGY;
				}
				break;
			case 'item':
				addToInventory(todaysReward.itemId, todaysReward.quantity);
				break;
		}
    
		console.log(`Recompensa diaria reclamada: ${todaysReward.text}`);
		alert(`¡Has recibido tu bono diario!\n\n${todaysReward.text}`);

		gameState.player.dailyRewardLastClaimed = currentDate;
		todaysReward = null;

		saveGameState();
		updateUI();
		dailyRewardModal.classList.add('hidden');
	}
	
	function selectDailyReward() {
		const rewards = GAME_DATA.DAILY_REWARDS;
		const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
		let randomNum = Math.random() * totalWeight;

		for (const reward of rewards) {
			if (randomNum < reward.weight) {
				return reward;
			}
			randomNum -= reward.weight;
		}
	}
	
	function useItem(itemId) {
		if (!hasInInventory(itemId, 1)) {
			console.error(`Intento de usar el item ${itemId} sin tenerlo.`);
			return;
		}

		const itemData = GAME_DATA.ITEMS[itemId];
		if (!itemData) return;

		if (itemData.restoresEnergy) {
			gameState.player.energy += itemData.restoresEnergy;
			if (gameState.player.energy > GAME_DATA.CONFIG.MAX_ENERGY) {
				gameState.player.energy = GAME_DATA.CONFIG.MAX_ENERGY;
			}
        
			removeFromInventory(itemId, 1);

			alert(`¡Has usado 1 ${itemData.name} y has recuperado ${itemData.restoresEnergy} de energía!`);
			saveGameState();
			updateUI();
			populateInventoryModal();
		} else {
			alert("Este item no se puede usar.");
		}
	}
	
	function getUnlockedTalentRank(talentId) {
		return gameState.player.unlockedTalents[talentId] || 0;
	}

	function spendTalentPoint(talentId) {
		const talentData = GAME_DATA.TALENTS[talentId];
		if (!talentData) {
			console.error(`Talento no encontrado: ${talentId}`);
			return;
		}

		const currentRank = getUnlockedTalentRank(talentId);

		if (currentRank >= talentData.maxRank) {
			alert("Ya has alcanzado el rango máximo para este talento.");
			return;
		}
		if (gameState.player.talentPoints < talentData.cost) {
			alert("No tienes suficientes puntos de talento.");
			return;
		}
		if (gameState.player.level < talentData.levelReq) {
			alert(`Necesitas ser nivel de jugador ${talentData.levelReq} para aprender este talento.`);
			return;
		}
		if (talentData.requires) {
			for (const reqId of talentData.requires) {
				const reqTalentData = GAME_DATA.TALENTS[reqId];
				if (getUnlockedTalentRank(reqId) < reqTalentData.maxRank) {
					alert(`Debes aprender completamente el talento "${reqTalentData.name}" primero.`);
					return;
				}
			}
		}
    
		gameState.player.talentPoints -= talentData.cost;
		gameState.player.unlockedTalents[talentId] = currentRank + 1;
		console.log(`Has aprendido "${talentData.name}" Rango ${currentRank + 1}.`);
		alert(`Has aprendido "${talentData.name}" Rango ${currentRank + 1}.`);
		saveGameState();
	}
	
	function getTalentBonus(effectType) {
		if (!gameState || !gameState.player) return 0;
		let totalBonus = 0;
    
		for (const talentId in gameState.player.unlockedTalents) {
			const rank = gameState.player.unlockedTalents[talentId];
			const talentData = GAME_DATA.TALENTS[talentId];

			if (talentData && talentData.effect.type === effectType) {
				totalBonus += talentData.effect.value * rank;
			}
		}
		return totalBonus;
	}
	
	function populateTalentTree() {
		talentTreeContainer.innerHTML = ''; 
		talentPointsDisplay.textContent = gameState.player.talentPoints;
		
		 // --- POSICIONAMIENTO COMPLETO PARA EL NUEVO DISEÑO VERTICAL ---
		const positions = {
			't1_growth_time':    'grid-column: 1 / 3; grid-row: 1;',
			't1_seed_saver':     'grid-column: 3 / 5; grid-row: 1;',
			't2_craft_speed':    'grid-column: 1 / 2; grid-row: 2;',
			't2_double_yield':   'grid-column: 4 / 5; grid-row: 2;',
			't3_ingredient_saver': 'grid-column: 1 / 2; grid-row: 3;',
			't3_seed_refund':    'grid-column: 4 / 5; grid-row: 3;',
			't3_energy_regen':   'grid-column: 2 / 4; grid-row: 4;',
			't4_energy_cost':    'grid-column: 1 / 2; grid-row: 5;',
			't4_quality_crops':  'grid-column: 4 / 5; grid-row: 5;',
			't4_daily_bonus':    'grid-column: 2 / 4; grid-row: 6;',
			't5_magic_fertilizer': 'grid-column: 1 / 2; grid-row: 7;',
			't5_market_instinct': 'grid-column: 4 / 5; grid-row: 7;',
			't5_growth_burst_ability': 'grid-column: 1 / 3; grid-row: 8;',
			't5_golden_harvest_ability': 'grid-column: 3 / 5; grid-row: 8;',
		};

		// --- CLASES PARA LOS CONECTORES VISUALES ---
		const connectorClasses = {
			't2_craft_speed':    'connector-up',
			't2_double_yield':   'connector-up',
			't3_ingredient_saver': 'connector-up',
			't3_seed_refund':    'connector-up',
			't3_energy_regen':   'connector-up-left connector-up-right',
			't4_energy_cost':    'connector-up-left',
			't4_quality_crops':  'connector-up-right',
			't4_daily_bonus':    'connector-up',
			't5_magic_fertilizer': 'connector-up',
			't5_market_instinct': 'connector-up',
			't5_growth_burst_ability': 'connector-up',
			't5_golden_harvest_ability': 'connector-up',
		};

		for (const talentId in GAME_DATA.TALENTS) {
			const talentData = GAME_DATA.TALENTS[talentId];
			const currentRank = getUnlockedTalentRank(talentId);
			let stateClass = 'locked';
			let canAfford = gameState.player.talentPoints >= talentData.cost;
			let levelMet = gameState.player.level >= talentData.levelReq;
			let reqsMet = true;
			if (talentData.requires) {
				for (const reqId of talentData.requires) {
					if (getUnlockedTalentRank(reqId) < GAME_DATA.TALENTS[reqId].maxRank) {
						reqsMet = false;
						break;
					}
				}
			}
			if (currentRank > 0) stateClass = 'unlocked';
			if (currentRank >= talentData.maxRank) stateClass = 'maxed';
			if (stateClass !== 'maxed' && canAfford && levelMet && reqsMet) {
				stateClass = 'available';
			}
        
			let reqHtml = `Req. Nivel: <span class="${levelMet ? 'met' : 'unmet'}">${talentData.levelReq}</span>`;
			if (talentData.requires) {
				talentData.requires.forEach(reqId => {
					const reqTalent = GAME_DATA.TALENTS[reqId];
					const reqMet = getUnlockedTalentRank(reqId) >= reqTalent.maxRank;
					reqHtml += `<br>Req: <span class="${reqMet ? 'met' : 'unmet'}">${reqTalent.name}</span>`;
				});
			}

			const node = document.createElement('div');
			const connectors = connectorClasses[talentId] || '';
			node.className = `talent-node ${stateClass} ${connectors}`;
			node.dataset.talentId = talentId;
			node.innerHTML = `
				<span class="talent-name">${talentData.name}</span>
				<span class="talent-rank">${currentRank} / ${talentData.maxRank}</span>
			`;
			if (positions[talentId]) {
				node.style.cssText = positions[talentId];
			}

			talentTreeContainer.appendChild(node);
		}
	}
	
	function populateShopModal() {
		const shopItemsContainer = document.getElementById('shop-items');
		shopItemsContainer.innerHTML = '';

		for (const itemId in GAME_DATA.ITEMS) {
			const itemData = GAME_DATA.ITEMS[itemId];

			if (itemData.price) {
				const itemElement = document.createElement('div');
				itemElement.className = 'shop-item';

				const itemImage = `assets/${itemId}.png`;

				itemElement.innerHTML = `
					<img src="${itemImage}" alt="${itemData.name}" onerror="this.src='assets/placeholder.png';">
					<div class="item-details">
						<span class="item-name">${itemData.name}</span>
						<span class="item-price">Precio: ${itemData.price} 💰</span>
					</div>
					<button class="modal-button" data-action="buy" data-item-id="${itemId}">Comprar</button>
				`;
				shopItemsContainer.appendChild(itemElement);
			}
		}
	}
	
	function selectSeedToPlant(seedId) {
		if (!seedId) return;

		gameState.currentSelection = { action: 'plant', item: seedId };
    
		console.log(`Semilla seleccionada para plantar: ${GAME_DATA.ITEMS[seedId].name}`);
		alert(`Has seleccionado: ${GAME_DATA.ITEMS[seedId].name}`);
    
		inventoryModal.classList.add('hidden');
		updateUI();
	}

    const moneyDisplay = document.getElementById('money-display');
    const carrotSeedsDisplay = document.getElementById('carrot-seeds-display');
	const energyDisplay = document.getElementById('energy-display');
	const levelDisplay = document.getElementById('level-display');
	const xpBarFill = document.getElementById('xp-bar-fill');
	const xpText = document.getElementById('xp-text');
	const skillsButton = document.querySelector('.action-button[data-action="skills"]');
	const skillsModal = document.getElementById('skills-modal');
	const closeSkillsButton = document.getElementById('close-skills-button');
	const skillsContainer = document.getElementById('skills-container');
	const talentsButton = document.querySelector('.action-button[data-action="talents"]');
	const talentsModal = document.getElementById('talents-modal');
	const closeTalentsButton = document.getElementById('close-talents-button');
	const talentTreeContainer = document.getElementById('talent-tree-container');
	const talentPointsDisplay = document.getElementById('talent-points-display-count');
	let talentTooltipCentral = null;
	const questsButton = document.querySelector('.action-button[data-action="quests"]');
	const questsModal = document.getElementById('quests-modal');
	const closeQuestsButton = document.getElementById('close-quests-button');
	const questsContainer = document.getElementById('quests-container');
	const dailyRewardModal = document.getElementById('daily-reward-modal');
	const claimRewardButton = document.getElementById('claim-reward-button');
	const dailyRewardText = document.getElementById('daily-reward-text');
    const plotElements = document.querySelectorAll('.plot');
    const plantButton = document.querySelector('.action-button[data-action="plant"]');
    const harvestButton = document.querySelector('.action-button[data-action="harvest"]');
    const shopButton = document.querySelector('.action-button[data-action="shop"]');
    const shopModal = document.getElementById('shop-modal');
    const closeShopButton = document.getElementById('close-shop-button');
	const inventoryButton = document.querySelector('.action-button[data-action="inventory"]');
	const inventoryModal = document.getElementById('inventory-modal');
	const closeInventoryButton = document.getElementById('close-inventory-button');
	const inventoryItemsContainer = document.getElementById('inventory-items');

    const ALL_CROP_CLASSES = ['plot-empty', 'plot-carrot-stage-0', 'plot-carrot-stage-1', 'plot-carrot-stage-2', 'plot-carrot-stage-3'];

    function formatTime(ms) {
        if (ms <= 0) return "¡Listo!";
        const seconds = Math.ceil(ms / 1000);
        return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }

    function updateUI() {
		moneyDisplay.textContent = Math.floor(gameState.player.money);
		carrotSeedsDisplay.textContent = gameState.inventory['carrot_seed'] || 0;
		
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
                plotBuyOverlayEl.innerHTML = `<span>${GAME_DATA.CONFIG.PLOT_COST} 💰</span>`;
                plotBuyOverlayEl.classList.remove('hidden');
            } else if (plotState.crop) {
                const cropData = GAME_DATA.CROPS[plotState.crop];
                const stages = cropData.stages;
                const totalGrowthTime = stages[stages.length - 1].duration;
				const growthTimeReduction = getTalentBonus('GROWTH_TIME_REDUCTION');
				const modifiedGrowthTime = totalGrowthTime * (1 - growthTimeReduction);
                const elapsedTime = Date.now() - plotState.plantedAt;
                
                let currentStage = stages[0];
                for (const stage of stages) {
                    if (elapsedTime >= stage.duration) { currentStage = stage; } else { break; }
                }
                plotEl.classList.add(currentStage.spriteClass);
                
                const remainingTime = modifiedGrowthTime - elapsedTime;
                plotTimerEl.textContent = formatTime(remainingTime);
                plotTimerEl.classList.remove('hidden');
            } else {
                plotEl.classList.add('plot-empty');
            }
        });
        
        plantButton.classList.toggle('active', gameState.currentSelection && gameState.currentSelection.action === 'plant');
        harvestButton.classList.toggle('active', gameState.currentSelection === 'harvest');
		levelDisplay.textContent = `Nvl ${gameState.player.level}`;
		const requiredXp = GAME_DATA.CONFIG.XP_FOR_LEVEL[gameState.player.level] || gameState.player.xp;
		xpText.textContent = `${Math.floor(gameState.player.xp)} / ${requiredXp}`;
		const xpPercentage = requiredXp > 0 ? (gameState.player.xp / requiredXp) * 100 : 100;
		xpBarFill.style.width = `${xpPercentage}%`;
    }
	
	function populateInventoryModal() {
		inventoryItemsContainer.innerHTML = '';
		if (Object.keys(gameState.inventory).length === 0) {
			inventoryItemsContainer.innerHTML = '<p>Tu inventario está vacío.</p>';
			return;
		}

		for (const itemId in gameState.inventory) {
			const quantity = gameState.inventory[itemId];
			if (quantity <= 0) continue;
			const itemData = GAME_DATA.ITEMS[itemId];
			if (!itemData) continue;

			const itemElement = document.createElement('div');
			itemElement.className = 'shop-item inventory-entry';
			itemElement.dataset.itemId = itemId;
			const itemImage = `assets/${itemId}.png`;
        
			let buttonsHtml = '';
			if (itemData.sellValue) {
				buttonsHtml += `<button class="modal-button" data-action="sell" data-item-id="${itemId}">Vender 1</button>`;
			}
			if (itemData.restoresEnergy) {
				buttonsHtml += `<button class="modal-button" data-action="use" data-item-id="${itemId}">Usar</button>`;
			}

			const sellValueText = itemData.sellValue ? `Valor: ${itemData.sellValue} 💰` : 'No se puede vender';

			itemElement.innerHTML = `
				<img src="${itemImage}" alt="${itemData.name}" onerror="this.src='assets/placeholder.png';">
				<div class="item-details">
					<span class="item-name">${itemData.name} (x${quantity})</span>
					<span class="item-price">${sellValueText}</span>
				</div>
				<div class="item-actions">
					${buttonsHtml}
				</div>
			`;
			inventoryItemsContainer.appendChild(itemElement);
		}
	}
	
	function populateQuestsModal() {
		questsContainer.innerHTML = '';

		if (!gameState.quests.active || gameState.quests.active.length === 0) {
			questsContainer.innerHTML = '<p>No hay nuevos pedidos en el tablón por hoy. ¡Vuelve mañana!</p>';
			return;
		}

		gameState.quests.active.forEach(questId => {
			const questData = GAME_DATA.QUESTS[questId];
			if (!questData) return;

			const questElement = document.createElement('div');
			questElement.className = 'quest-entry';

			let requirementsHtml = '';
			let canComplete = true;
			questData.requirements.forEach(req => {
				const hasItems = hasInInventory(req.itemId, req.quantity);
				if (!hasItems) canComplete = false; 
				const itemName = GAME_DATA.ITEMS[req.itemId].name;
				requirementsHtml += `<span style="color: ${hasItems ? 'inherit' : '#ff77a8'};">- ${itemName} (${gameState.inventory[req.itemId] || 0} / ${req.quantity})</span>`;
			});

			let rewardsHtml = '';
			if (questData.rewards.money) {
				rewardsHtml += `<span>- ${questData.rewards.money} 💰</span>`;
			}
			if (questData.rewards.playerXp) {
				rewardsHtml += `<span>- ${questData.rewards.playerXp} XP</span>`;
			}

			questElement.innerHTML = `
				<h3 class="quest-title">${questData.title}</h3>
				<p class="quest-description">${questData.description}</p>
				<div class="quest-details">
					<div class="quest-requirements">
						<h4>Requisitos:</h4>
						${requirementsHtml}
					</div>
					<div class="quest-rewards">
						<h4>Recompensas:</h4>
						${rewardsHtml}
					</div>
				</div>
				<button class="modal-button" data-action="complete-quest" data-quest-id="${questId}" ${canComplete ? '' : 'disabled'}>
					${canComplete ? 'Completar' : 'Faltan Recursos'}
				</button>
        `	;
        
			questsContainer.appendChild(questElement);
		});
	}

    shopButton.addEventListener('click', () => {
		populateShopModal();
		shopModal.classList.remove('hidden');
	});
	document.getElementById('shop-items').addEventListener('click', (event) => {
		const target = event.target;
		if (target.matches('[data-action="buy"]')) {
			const itemId = target.dataset.itemId;
			const itemData = GAME_DATA.ITEMS[itemId];

			if (itemData && gameState.player.money >= itemData.price) {
				gameState.player.money -= itemData.price;
				addToInventory(itemId, 1);
				saveGameState();
				updateUI();
			} else {
				alert("¡No tienes suficiente dinero!");
			}
		}
	});
    closeShopButton.addEventListener('click', () => shopModal.classList.add('hidden'));
	skillsButton.addEventListener('click', () => {
		populateSkillsModal(); // ¡Llamaremos a una nueva función para llenarlo!
		skillsModal.classList.remove('hidden');
	});
	closeSkillsButton.addEventListener('click', () => skillsModal.classList.add('hidden'));
	questsButton.addEventListener('click', () => {
		populateQuestsModal();
		questsModal.classList.remove('hidden');
	});
	closeQuestsButton.addEventListener('click', () => questsModal.classList.add('hidden'));
	questsContainer.addEventListener('click', (event) => {
		const target = event.target;

		if (target.matches('[data-action="complete-quest"]')) {
			const questId = target.dataset.questId;
			if (!questId) return;
			completeQuest(questId);
		}
	});
	claimRewardButton.addEventListener('click', claimDailyReward);
	inventoryButton.addEventListener('click', () => {
		populateInventoryModal();
		inventoryModal.classList.remove('hidden');
	});
	closeInventoryButton.addEventListener('click', () => inventoryModal.classList.add('hidden'));
	inventoryItemsContainer.addEventListener('click', (event) => {
		const target = event.target;
    
		const itemRow = target.closest('.inventory-entry');
		if (!itemRow) return;

		const itemId = itemRow.dataset.itemId;
		if (!itemId) return;

		const clickedButton = target.closest('.modal-button');

		if (clickedButton) {
			const action = clickedButton.dataset.action;

			if (action === 'sell') {
				const itemData = GAME_DATA.ITEMS[itemId];
				if (itemData && itemData.sellValue) {
					if (removeFromInventory(itemId, 1)) {
						gameState.player.money += itemData.sellValue;
						saveGameState();
						updateUI();
						populateInventoryModal();
					}
				}
			} else if (action === 'use') {
				useItem(itemId);
			}
		} 
		else {
			if (itemId.includes('_seed')) {
				selectSeedToPlant(itemId);
			}
		}
	});
    plantButton.addEventListener('click', () => {
		if (gameState.currentSelection && gameState.currentSelection.action === 'plant') {
			gameState.currentSelection = null;
		} else {
			gameState.currentSelection = { action: 'plant', item: null };
			alert("Selecciona una semilla de tu inventario para plantar.");
		}
		updateUI();
	});
    harvestButton.addEventListener('click', () => {
        gameState.currentSelection = (gameState.currentSelection === 'harvest') ? null : 'harvest';
        updateUI();
    });
	talentsButton.addEventListener('click', () => {
		if (!talentTooltipCentral) {
			talentTooltipCentral = document.createElement('div');
			talentTooltipCentral.id = 'talent-tooltip-central';
			talentTooltipCentral.className = 'talent-tooltip'; 
        
			talentsModal.querySelector('.modal-content').appendChild(talentTooltipCentral);
		}

		populateTalentTree();
		talentsModal.classList.remove('hidden');
	});
	closeTalentsButton.addEventListener('click', () => talentsModal.classList.add('hidden'));
	talentTreeContainer.addEventListener('click', (event) => {
		const targetNode = event.target.closest('.talent-node');
		if (targetNode && targetNode.dataset.talentId) {
			spendTalentPoint(targetNode.dataset.talentId);
			populateTalentTree(); // Re-dibujamos el árbol para mostrar los cambios
		}
	});
	talentTreeContainer.addEventListener('mouseover', (event) => {
		const targetNode = event.target.closest('.talent-node');
		if (targetNode && targetNode.dataset.talentId) {
			const talentId = targetNode.dataset.talentId;
			const talentData = GAME_DATA.TALENTS[talentId];
			const currentRank = getUnlockedTalentRank(talentId);

			let levelMet = gameState.player.level >= talentData.levelReq;
			let reqHtml = `Req. Nivel: <span class="${levelMet ? 'met' : 'unmet'}">${talentData.levelReq}</span>`;
			if (talentData.requires) {
				talentData.requires.forEach(reqId => {
					const reqTalent = GAME_DATA.TALENTS[reqId];
					const reqMet = getUnlockedTalentRank(reqId) >= reqTalent.maxRank;
					reqHtml += `<br>Req: <span class="${reqMet ? 'met' : 'unmet'}">${reqTalent.name}</span>`;
				});
			}

			talentTooltipCentral.innerHTML = `
				<div class="tooltip-title">${talentData.name}</div>
				<p class="tooltip-desc">${talentData.description}</p>
				<p class="tooltip-rank">Rango Actual: ${currentRank} / ${talentData.maxRank}</p>
				<p class="tooltip-req">${reqHtml}</p>
				<p class="tooltip-cost">Coste: ${talentData.cost} Puntos</p>
			`;
        
			talentTooltipCentral.classList.add('visible');
		}
	});

	talentTreeContainer.addEventListener('mouseout', (event) => {
		talentTooltipCentral.classList.remove('visible');
	});

    plotElements.forEach(plotEl => {
		plotEl.addEventListener('click', () => {
			const plotId = plotEl.dataset.plotId;
			const plotState = gameState.plots[plotId];

			if (plotState.isLocked) {
				if (gameState.player.money >= GAME_DATA.CONFIG.PLOT_COST) {
					if (confirm(`¿Quieres comprar esta parcela por ${GAME_DATA.CONFIG.PLOT_COST} monedas?`)) {
						gameState.player.money -= GAME_DATA.CONFIG.PLOT_COST;
						plotState.isLocked = false;
						saveGameState();
					}
				} else {
					alert("¡No tienes suficiente dinero para comprar esta parcela!");
				}
				gameState.currentSelection = null;
				updateUI();
				return;
			}

			if (gameState.currentSelection && gameState.currentSelection.action === 'plant') {
				const seedId = gameState.currentSelection.item;
    			if (!seedId) return; 

    			const cropId = Object.keys(GAME_DATA.CROPS).find(key => GAME_DATA.CROPS[key].seedId === seedId);
    			if (!cropId) {
        			console.error(`No se encontró un cultivo para la semilla: ${seedId}`);
        			return;
    			}
    			const cropData = GAME_DATA.CROPS[cropId];

    			if (cropData.requiredFarmingLevel && gameState.player.skills.farming.level < cropData.requiredFarmingLevel) {
        			alert(`No tienes suficiente nivel de Granjero para plantar esto.\nRequiere Nivel ${cropData.requiredFarmingLevel}.`);
        			gameState.currentSelection = null; // Deseleccionamos para evitar más intentos
        			updateUI();
        			return;
    			}

    			let plantCost = GAME_DATA.CONFIG.ACTIONS_COST.PLANT - getTalentBonus('ENERGY_COST_REDUCTION');
    			if (plantCost < 1) plantCost = 1;

    			if (gameState.player.energy < plantCost) {
        			alert(`No tienes suficiente energía para plantar. (Necesitas ${plantCost})`);
        			return;
    			}
    			if (plotState.crop === null && hasInInventory(seedId, 1)) {
        			gameState.player.energy -= plantCost;

        			const seedSaverBonus = getTalentBonus('SEED_SAVER_CHANCE');
        			if (Math.random() > seedSaverBonus) {
            			removeFromInventory(seedId, 1);
        			} else {
            			alert("¡Suerte! No has gastado la semilla.");
        			}

        			plotState.crop = cropId; 
        			plotState.plantedAt = Date.now();
        
        			gameState.currentSelection = null;
        			saveGameState();
    			} else if (!hasInInventory(seedId, 1)) {
        			alert(`¡No tienes semillas de ${GAME_DATA.ITEMS[seedId].name}!`);
        			gameState.currentSelection = null;
    			}
			}
        
			else if (gameState.currentSelection === 'harvest') {
				if (plotState.crop) {
					let harvestCost = GAME_DATA.CONFIG.ACTIONS_COST.PLANT - getTalentBonus('ENERGY_COST_REDUCTION');
					if (harvestCost < 1) harvestCos = 1;

					if (gameState.player.energy < harvestCost) {
						alert(`No tienes suficiente energía para cosechar. (Necesitas ${harvestCost})`);
						return; 
					}
                
					const cropData = GAME_DATA.CROPS[plotState.crop];
					const totalGrowthTime = cropData.stages[cropData.stages.length - 1].duration;
					const growthTimeReduction = getTalentBonus('GROWTH_TIME_REDUCTION');
					const modifiedGrowthTime = totalGrowthTime * (1 - growthTimeReduction);
					const elapsedTime = Date.now() - plotState.plantedAt;
                
					if (elapsedTime >= modifiedGrowthTime) {
						gameState.player.energy -= harvestCost;
                    
						let quantityToHarvest = 1;
						const doubleYieldBonus = getTalentBonus('DOUBLE_YIELD_CHANCE');
						if (Math.random() < doubleYieldBonus) {
							quantityToHarvest = 2;
							console.log("¡Cosecha Abundante! Has recolectado el doble.");
							alert("¡Cosecha Abundante! Has recolectado el doble.");
						}
        
						const harvestedItemId = plotState.crop;
						addToInventory(harvestedItemId, quantityToHarvest); // Usamos la cantidad calculada
						
						addSkillXp('farming', GAME_DATA.CONFIG.XP_REWARDS.FARMING_XP);
                    
						plotState.crop = null;
						plotState.plantedAt = 0;
						saveGameState();
					} else {
						alert("¡Aún no está listo para cosechar!");
					}
				}
			}
        
			gameState.currentSelection = null;
			updateUI();
		});
	});
	
	let lastTickTime = Date.now();
	let todaysReward = null;

    function gameLoop() {
		const now = Date.now();
		const deltaTime = (now - lastTickTime) / 1000; // Tiempo en segundos desde el último frame
		lastTickTime = now;

		// --- LÓGICA DE REGENERACIÓN EN TIEMPO REAL ---
		if (gameState.player.energy < GAME_DATA.CONFIG.MAX_ENERGY) {
			const regenBonus = getTalentBonus('ENERGY_REGEN_INCREASE');
			const modifiedRegenRate = GAME_DATA.CONFIG.ENERGY_REGEN_RATE_PER_SECOND * (1 + regenBonus);
			const energyToAdd = deltaTime * modifiedRegenRate;
			gameState.player.energy += energyToAdd;
			if (gameState.player.energy > GAME_DATA.CONFIG.MAX_ENERGY) {
				gameState.player.energy = GAME_DATA.CONFIG.MAX_ENERGY;
			}
		}
		energyDisplay.textContent = Math.floor(gameState.player.energy);
    
		updateUI();
		requestAnimationFrame(gameLoop);
	}
    gameLoop();
});