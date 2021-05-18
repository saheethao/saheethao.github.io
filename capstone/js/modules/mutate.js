/* Contains all mutation modules */


/* START OF MUTATION MODULES */

/*
 * Chance of chance to flip a bit
 * args: <pop> <chance> <rate>
 */
export function chanceFlip(args) {
	let mutpop = [];
	let pop = args[0];
	for (let idx = 0; idx < pop.length; idx++) {
		let mutInd = pop[idx].clone();
		if (Math.random() < args[2]) {
	
			let fullGenome = mutInd.genome.concat(mutInd.hist);
		
			for (let i = 0; i < fullGenome.length; i++) {
				if (Math.random() < args[1]) {
					fullGenome[i] = fullGenome[i]^1; // XOR
				}
			}
			mutInd.genome = fullGenome.slice(0, mutInd.genome.length);
			mutInd.hist = fullGenome.slice(mutInd.genome.length, mutInd.genome.length + mutInd.hist.length);
		}
		mutpop.push(mutInd);
	}
	return mutpop;
}

/*
 * Pick num positions to flip
 * args: <pop> <num> <rate>
 */
export function setFlip(args) {
	let mutpop = [];
	let pop = args[0];
	for (let idx = 0; idx < pop.length; idx++) {
		let mutInd = pop[idx].clone();

		if (Math.random() < args[2]) {	
			let fullGenome = mutInd.genome.concat(mutInd.hist);
	
			let positions = _.shuffle(_.range(fullGenome.length));
			for (let i = 0; i < args[1]; i++) {
				let pos = positions[i];
				fullGenome[pos] = fullGenome[pos]^1;
			}
			mutInd.genome = fullGenome.slice(0, mutInd.genome.length);
			mutInd.hist = fullGenome.slice(mutInd.genome.length, mutInd.genome.length + mutInd.hist.length);
		}
		mutpop.push(mutInd);
	}
	return mutpop;
}

/*
 * Pick num positions to swap
 * args: <pop> <num> <rate>
 */
export function swap(args) {
	let mutpop = [];
	let pop = args[0];
	for (let idx = 0; idx < pop.length; idx++) {
		let mutInd = pop[idx].clone();
		if (!(Math.random() < args[2])) {
	
			let fullGenome = mutInd.genome.concat(mutInd.hist);
	
			let positions = _.shuffle(_.range(fullGenome.length));
	
			let len = args[1] * 2;
			for (let i = 0; i < len; i += 2) {
				let pos0 = positions[i];
				let pos1 = positions[i + 1];
				let temp = fullGenome[pos0];
				fullGenome[pos0] = fullGenome[pos1];
				fullGenome[pos1] = temp;
			}
	
			mutInd.genome = fullGenome.slice(0, mutInd.genome.length);
			mutInd.hist = fullGenome.slice(mutInd.genome.length, mutInd.genome.length + mutInd.hist.length);
		}
	}
	return mutInd;
}

/* END OF MUTATION MODULES */

export class ModuleManager {
	constructor() {
		this.map = {
			'chanceFlip': chanceFlip,
			'setFlip': setFlip,
			'swap': swap,
		};
	}
	
	getModule(name) {
		return this.map[name];
	}
}



