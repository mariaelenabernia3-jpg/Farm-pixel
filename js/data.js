// js/data.js

const GAME_DATA = {

    // ========================================================================
    // CONFIGURACIÓN GENERAL DEL JUEGO
    // Aquí van todos los números de balanceo: costos, valores iniciales, etc.
    // ========================================================================
    CONFIG: {
        PLOT_COST: 500, // Costo para desbloquear una nueva parcela
        PLAYER_STARTING_MONEY: 100, // Dinero inicial del jugador
		ACTIONS_COST: {
			PLANT: 2,    // Plantar una semilla costará 2 de energía
			HARVEST: 1,  // Cosechar un cultivo costará 1 de energía
		},
		ENERGY_REGEN_RATE_PER_SECOND: 1 / 60, // 1 de energía cada 60 segundos
		MAX_ENERGY: 100, // La energía máxima que un jugador puede tener
		XP_FOR_LEVEL: [
			0,      // Nivel 0 (no se usa)
			100,    // Nivel 1 -> 2
			250,    // Nivel 2 -> 3
			500,    // Nivel 3 -> 4
			1000,   // Nivel 4 -> 5
		],
		SKILL_XP_FOR_LEVEL: [
			0,      // Nivel 0 (no se usa)
			20,     // Nivel 1 -> 2
			50,     // Nivel 2 -> 3
			100,    // Nivel 3 -> 4
			250,    // Nivel 4 -> 5
		],
		XP_REWARDS: {
			FARMING_XP: 5,  // Ganar 5 XP de Granjero por cosecha
			CRAFTING_XP: 15 // Ganar 15 XP de Crafteo por cada crafteo
		}
    },

    // ========================================================================
    // BASE DE DATOS DE ITEMS
    // Cada item del juego (semillas, cultivos, productos procesados) se define aquí.
    // La clave (ej. 'carrot_seed') es el ID único que usaremos en el código.
    // ========================================================================
    ITEMS: {
		// --- Semillas ---
		'carrot_seed': {
			name: 'Semilla de Zanahoria',
			price: 10,
			// Sin requisito, disponible desde el principio
		},
		'wheat_seed': {
			name: 'Semilla de Trigo',
			price: 20,
			skillReq: { skill: 'farming', level: 2 }
		},
		'coffee_bean_seed': {
			name: 'Semilla de Grano de Café',
			price: 45,
			skillReq: { skill: 'farming', level: 5 }
		},
		'strawberry_seed': {
			name: 'Semilla de Fresa',
			price: 60,
			skillReq: { skill: 'farming', level: 8 }
		},
		'pumpkin_seed': {
			name: 'Semilla de Calabaza',
			price: 100,
			skillReq: { skill: 'farming', level: 12 }
		},

		// --- Cultivos Cosechados ---
		'carrot': { name: 'Zanahoria', sellValue: 25 },
		'wheat': { name: 'Trigo', sellValue: 45 },
		'coffee_bean': { name: 'Grano de Café', sellValue: 60 },
		'strawberry': { name: 'Fresa', sellValue: 85 },
		'pumpkin': { name: 'Calabaza', sellValue: 150 },
    
		// --- Productos Crafteados ---
		'flour': { name: 'Harina', sellValue: 150 },
		'coffee': { name: 'Café', restoresEnergy: 20 },
		'carrot_cake': { name: 'Pastel de Zanahoria', sellValue: 250, restoresEnergy: 50 }
	},

    // ========================================================================
    // DEFINICIÓN DE CULTIVOS
    // Aquí se define cómo crece cada cultivo.
    // La clave (ej. 'carrot') debe coincidir con el ID del item cosechado.
    // ========================================================================
    CROPS: {
        'carrot': {
            seedId: 'carrot_seed',
            stages: [
                { duration: 10 * 1000, spriteClass: 'plot-carrot-stage-0' }, // 10 seg
                { duration: 20 * 1000, spriteClass: 'plot-carrot-stage-1' }, // 20 seg
                { duration: 30 * 1000, spriteClass: 'plot-carrot-stage-2' }, // 30 seg
                { duration: 40 * 1000, spriteClass: 'plot-carrot-stage-3' }  // 40 seg (maduro)
            ]
        },
        'wheat': {
            seedId: 'wheat_seed',
			requiredFarmingLevel: 2,
            stages: [
                { duration: 20 * 1000, spriteClass: 'plot-carrot-stage-0' }, // 20 seg
                { duration: 40 * 1000, spriteClass: 'plot-carrot-stage-1' }, // 40 seg
                { duration: 60 * 1000, spriteClass: 'plot-carrot-stage-2' }, // 1 min
                { duration: 80 * 1000, spriteClass: 'plot-carrot-stage-3' }  // 1 min 20 seg (maduro)
            ]
        },
		'coffee_bean': {
			seedId: 'coffee_bean_seed',
			requiredFarmingLevel: 5,
			stages: [
                { duration: 20 * 1000, spriteClass: 'plot-carrot-stage-0' }, // 20 seg
                { duration: 40 * 1000, spriteClass: 'plot-carrot-stage-1' }, // 40 seg
                { duration: 60 * 1000, spriteClass: 'plot-carrot-stage-2' }, // 1 min
                { duration: 80 * 1000, spriteClass: 'plot-carrot-stage-3' }  // 1 min 20 seg (maduro)
            ]
		},
		'strawberry': {
			seedId: 'strawberry_seed',
			requiredFarmingLevel: 8,
			stages: [
                { duration: 20 * 1000, spriteClass: 'plot-carrot-stage-0' }, // 20 seg
                { duration: 40 * 1000, spriteClass: 'plot-carrot-stage-1' }, // 40 seg
                { duration: 60 * 1000, spriteClass: 'plot-carrot-stage-2' }, // 1 min
                { duration: 80 * 1000, spriteClass: 'plot-carrot-stage-3' }  // 1 min 20 seg (maduro)
            ]
		},
		'pumpkin': {
			seedId: 'pumpkin_seed',
			requiredFarmingLevel: 12,
			stages: [
                { duration: 20 * 1000, spriteClass: 'plot-carrot-stage-0' }, // 20 seg
                { duration: 40 * 1000, spriteClass: 'plot-carrot-stage-1' }, // 40 seg
                { duration: 60 * 1000, spriteClass: 'plot-carrot-stage-2' }, // 1 min
                { duration: 80 * 1000, spriteClass: 'plot-carrot-stage-3' }  // 1 min 20 seg (maduro)
            ]
		}
    },
	
	// ========================================================================
	// DEFINICIÓN DE RECETAS DE CRAFTEO
	// Aquí se define cómo se transforman los items.
	// ========================================================================
	CRAFTING_RECIPES: {
		'flour': {
			name: 'Moler Harina',
			ingredients: [
				{ itemId: 'wheat', quantity: 3 } // Necesita 3 de Trigo
			],
			output: {
				itemId: 'flour', // Produce 1 de Harina
				quantity: 1
			}
		},
		'coffee': {
			name: 'Preparar Café',
			ingredients: [
				{ itemId: 'coffee_bean', quantity: 5 }
			],
			output: { itemId: 'coffee', quantity: 1 }
		},
		'carrot_cake': {
			name: 'Hornear Pastel de Zanahoria',
			ingredients: [
				{ itemId: 'carrot', quantity: 3 },
				{ itemId: 'flour', quantity: 1 }
			],
			output: { itemId: 'carrot_cake', quantity: 1 }
		}
	},
	
	// ========================================================================
	// BASE DE DATOS DE MISIONES
	// Define todas las misiones posibles que pueden aparecer en el tablón.
	// ========================================================================
	QUESTS: {
		// Cada clave es un ID único para la misión
		'collect_carrots_1': {
			title: '¡Zanahorias para el Estofado!',
			description: 'El chef del pueblo necesita zanahorias frescas para su famoso estofado.',
			requirements: [
				{ itemId: 'carrot', quantity: 5 } // Requisito: 5 zanahorias
			],
			rewards: {
				money: 150,
				playerXp: 20 // ¡Esta es la fuente de XP de Jugador!
			}
		},
		'need_flour_1': {
			title: 'Harina para el Panadero',
			description: '¡El panadero se ha quedado sin harina! Ayúdale a preparar el pan del día.',
			requirements: [
				{ itemId: 'flour', quantity: 2 }
			],
			rewards: {
				money: 350,
				playerXp: 50
			}
		},
		'wheat_for_chickens': {
			title: 'Grano para las Gallinas',
			description: 'La granjera necesita trigo para alimentar a sus gallinas. ¡Pagan bien!',
			requirements: [
				{ itemId: 'wheat', quantity: 10 }
			],
			rewards: {
				money: 500,
				playerXp: 40
			}
		}
	},
	
	// ========================================================================
	// RECOMPENSAS DIARIAS POSIBLES
	// Define los premios que pueden salir en el bono de login diario.
	// ========================================================================
	DAILY_REWARDS: [
		{
			type: 'money',
			value: 200,
			weight: 40, // Alta probabilidad
			text: '200 Monedas 💰'
		},
		{
			type: 'item',
			itemId: 'carrot_seed',
			quantity: 5,
			weight: 30, // Probabilidad media
			text: '5 Semillas de Zanahoria 🥕'
		},
		{
			type: 'energy',
			value: 50, // ¡No es una recarga completa! Es una cantidad fija.
			weight: 20, // Probabilidad baja
			text: '¡Bono de 50 de Energía! ⚡'
		},
		{
			type: 'item',
			itemId: 'wheat_seed',
			quantity: 3,
			weight: 10, // Probabilidad rara
			text: '¡3 Semillas de Trigo! 🌱'
		}
	],
	
	// ========================================================================
	// ÁRBOL DE TALENTOS DE GRANJERO (UNIFICADO)
	// ========================================================================
	TALENTS: {
		// --- TIER 1 ---
		't1_growth_time': {
			name: 'Tierra Fértil',
			description: 'Reduce el tiempo de crecimiento de los cultivos en un 5% por rango.',
			skill: 'farming', levelReq: 2, cost: 1, maxRank: 3,
			requires: null,
			effect: { type: 'GROWTH_TIME_REDUCTION', value: 0.05 }
		},
		't1_seed_saver': {
			name: 'Mano Verde',
			description: 'Otorga un 5% de probabilidad por rango de no consumir una semilla al plantar.',
			skill: 'farming', levelReq: 2, cost: 1, maxRank: 3,
			requires: null,
			effect: { type: 'SEED_SAVER_CHANCE', value: 0.05 }
		},

		// --- TIER 2 ---
		't2_craft_speed': {
			name: 'Engranajes Aceitados',
			description: 'Aumenta la velocidad de crafteo en todas las máquinas un 10% por rango.',
			skill: 'farming', levelReq: 10, cost: 1, maxRank: 3,
			requires: ['t1_growth_time'],
			effect: { type: 'CRAFTING_SPEED_INCREASE', value: 0.10 }
		},
		't2_double_yield': {
			name: 'Cosecha Abundante',
			description: 'Otorga un 5% de probabilidad por rango de duplicar la cosecha de un cultivo.',
			skill: 'farming', levelReq: 10, cost: 2, maxRank: 3,
			requires: ['t1_seed_saver'],
			effect: { type: 'DOUBLE_YIELD_CHANCE', value: 0.05 }
		},

		// --- TIER 3 ---
		't3_ingredient_saver': {
			name: 'Producción en Masa',
			description: 'Al craftear, tienes un 5% de probabilidad por rango de no consumir los ingredientes.',
			skill: 'farming', levelReq: 20, cost: 3, maxRank: 2,
			requires: ['t2_craft_speed'],
			effect: { type: 'INGREDIENT_SAVER_CHANCE', value: 0.05 }
		},
		't3_seed_refund': {
			name: 'Semilla Eterna',
			description: 'Al cosechar, tienes un 10% de probabilidad por rango de obtener una semilla del cultivo recolectado.',
			skill: 'farming', levelReq: 20, cost: 3, maxRank: 2,
			requires: ['t2_double_yield'],
			effect: { type: 'SEED_REFUND_CHANCE', value: 0.10 }
		},
		't3_energy_regen': {
			name: 'Sincronía',
			description: 'La regeneración pasiva de energía aumenta permanentemente en un 10%.',
			skill: 'farming', levelReq: 25, cost: 4, maxRank: 1,
			requires: ['t2_craft_speed', 't2_double_yield'],
			effect: { type: 'ENERGY_REGEN_INCREASE', value: 0.10 }
		},

		// --- TIER 4 ---
		't4_energy_cost': {
			name: 'Eficiencia Energética',
			description: 'Las acciones de plantar, cosechar y craftear cuestan 1 menos de energía por rango (mínimo 1).',
			skill: 'farming', levelReq: 30, cost: 2, maxRank: 3,
			requires: ['t3_ingredient_saver'],
			effect: { type: 'ENERGY_COST_REDUCTION', value: 1 }
		},
		't4_quality_crops': {
			name: 'Cultivos de Calidad',
			description: 'Otorga un 10% de probabilidad por rango de que una cosecha sea de "Calidad", aumentando su valor de venta un 25%.',
			skill: 'farming', levelReq: 30, cost: 2, maxRank: 3,
			requires: ['t3_seed_refund'],
			effect: { type: 'QUALITY_CROP_CHANCE', value: 0.10, multiplier: 1.25 }
		},
		't4_daily_bonus': {
			name: 'Bono Diario Mejorado',
			description: 'Las recompensas del Bono Diario son un 15% mejores por rango.',
			skill: 'farming', levelReq: 35, cost: 3, maxRank: 2,
			requires: ['t3_energy_regen'],
			effect: { type: 'DAILY_BONUS_INCREASE', value: 0.15 }
		},

		// --- TIER 5 (FINALES) ---
		't5_magic_fertilizer': {
			name: 'Fertilizante Mágico',
			description: 'Desbloquea la receta de "Fertilizante Mágico" (+50% velocidad de crecimiento para un cultivo).',
			skill: 'farming', levelReq: 40, cost: 4, maxRank: 1,
			requires: ['t4_energy_cost'],
			effect: { type: 'UNLOCK_RECIPE', value: 'magic_fertilizer' }
		},
		't5_growth_burst_ability': {
			name: 'Ráfaga de Crecimiento',
			description: 'HABILIDAD ACTIVA: Todos los cultivos avanzan su crecimiento en 2 horas. Cooldown: 22 horas.',
			skill: 'farming', levelReq: 50, cost: 7, maxRank: 1,
			requires: ['t5_magic_fertilizer'],
			effect: { type: 'ACTIVE_GROWTH_BOOST', value: 2 * 3600 * 1000, cooldown: 22 * 3600 * 1000 }
		},
		't5_market_instinct': {
			name: 'Instinto de Mercader',
			description: 'Desbloquea la capacidad de ver las "demandas del mercado" en el tablón de anuncios.',
			skill: 'farming', levelReq: 40, cost: 4, maxRank: 1,
			requires: ['t4_quality_crops'],
			effect: { type: 'UNLOCK_FEATURE', value: 'market_demands' }
		},
		't5_golden_harvest_ability': {
			name: 'Cosecha Dorada',
			description: 'HABILIDAD ACTIVA: Durante 10 minutos, todas tus cosechas son dobles y de "Calidad" garantizada. Cooldown: 22 horas.',
			skill: 'farming', levelReq: 50, cost: 7, maxRank: 1,
			requires: ['t5_market_instinct'],
			effect: { type: 'ACTIVE_HARVEST_BUFF', duration: 10 * 60 * 1000, cooldown: 22 * 3600 * 1000 }
		}
	},
	
	// ========================================================================
	// DATOS DE PROGRESIÓN DE HABILIDADES
	// Define los desbloqueos que ocurren en cada nivel de habilidad.
	// ========================================================================
	SKILLS_DATA: {
		farming: { // Para la habilidad de Granjero
			unlocks: {
				'2': 'wheat_seed',
				'5': 'coffee_bean_seed',
				'8': 'strawberry_seed',
				'12': 'pumpkin_seed'
			}
		}
	}
};