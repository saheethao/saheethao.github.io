/* Contains all envorment modules */


/* START OF ENVIROMENT MODULES */

/*
 * Evolve
 * args: <generations>
 */
function basic(pop, mutationFunc, crossoverFunc, objectiveFunc, selectionFunc, args) {
	for (let gen = 0; gen < args[0]; gen++) {
		/* Evaluate */
		pop = playFunc(pop);
		
		/* Offspring */
		let off = [];
		for (let i = 0; i < pop.length; i++) {
			off.push(pop[i].clone());
		}
		off = crossoverFunc(off);
		off = mutationFunc(off);
		
		/* Evaluate */
		pop = pop.concat(off);
		pop = playFunc(pop);
		
		/* Selection */
		pop = selectionFunc(pop, off);
	}
	return pop;
}

/* END OF ENVIROMENT MODULES */

export class ModuleManager {
	constructor() {
		this.map = {
			'npoint': npoint,
			'chance': chance,
			'chanceBase': chanceBase,
		};
	}
	
	getModule(name) {
		return this.map[name];
	}
}




