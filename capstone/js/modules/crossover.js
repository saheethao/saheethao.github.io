/* Contains all crossover modules */


/* START OF CROSSOVER MODULES */

/*
 * Choose n points from parents
 * args: <parents> <numOff> <n> <rate>
 */
export function npoint(args) {
	if (!(Math.random() < args[3])) {
		return null;
	}
	let parents = args[0];
	let numOff = args[1];
	
	let fullGenomes = [];
	let offspring = [];
	for (let i = 0; i < parents.length; i++) {
		let newInd = parents[i].clone();
		offspring.push(newInd);
		let fullGenome = newInd.genome.concat(newInd.hist);
		fullGenomes.push(fullGenome);
	}
	
	let offspringFullGenomes = [];
	for (let i = 0; i < numOff; i++) {
		let positions = _.shuffle(_.range(1, fullGenomes[0].length - 1));
		let points = positions.slice(0, args[2]);
		points.push(0);
		points.push(fullGenomes[0].length);
		points.sort();
		_.shuffle(fullGenomes);
		let off = [];
		for (let p = 0; p < points.length; p++) {
			// Get points
			let pointStart = points[p];
			let pointEnd = points[p + 1];
			// Get parent
			let g = fullGenomes[p % fullGenomes.length];
			off = off.concat(g.slice(pointStart, pointEnd));
		}
		offspringFullGenomes.push(off);
	}
	
	/* Set offsprings */
	for (let i = 0; i < offspring.length; i++) {
		let ind = offspring[i];
		ind.genome = offspringFullGenomes[i].slice(0, ind.genome.length);
		ind.hist = offspringFullGenomes[i].slice(ind.genome.length, ind.genome.length + ind.hist.length);
		offspring[i] = ind;
	}
	
	return offspring;
}

/*
 * For each offspring, use a random parent as a base. Then use the other parents for genetic material.
 * args: <parents> <numOff> <chance> <rate>
 */
export function chance(args) {
	if (!(Math.random() < args[3])) {
		return null;
	}
	let parents = args[0];
	let numOff = args[1];
	
	let fullGenomes = [];
	let offspring = [];
	for (let i = 0; i < parents.length; i++) {
		let newInd = parents[i].clone();
		offspring.push(newInd);
		let fullGenome = newInd.genome.concat(newInd.hist);
		fullGenomes.push(fullGenome);
	}
	
	let offspringFullGenomes = [];
	for (let i = 0; i < numOff; i++) {
		_.shuffle(fullGenomes);
		let off = [];
		let base = fullGenomes[0];
		let rest = fullGenomes.slice(1, fullGenomes.length);

		for (let p = 0; p < fullGenomes[0].length; p++) {
			if (Math.random() < args[2]) {
				let par = [];
				if (rest.length > 1) {
					par = _.sample(rest, 1);
				} else {
					par = rest[0];
				}
				off.push(par[p]);
			} else {
				off.push(base[p]);
			}
		}
		offspringFullGenomes.push(off);
	}
	
	/* Set offsprings */
	for (let i = 0; i < offspring.length; i++) {
		let ind = offspring[i];
		ind.genome = offspringFullGenomes[i].slice(0, ind.genome.length);
		ind.hist = offspringFullGenomes[i].slice(ind.genome.length, ind.genome.length + ind.hist.length);
		offspring[i] = ind;
	}
	
	return offspring;
}

/*
 * For each offspring, use a random parent from base as a base. Then use the other parents for genetic material.
 * args: <parents> <numOff> <chance> <base(s) should be an array> <rate>
 */
export function chanceBase(args) {
	if (!(Math.random() < args[4])) {
		return null;
	}
	let parents = args[0];
	let numOff = args[1];
	
	let fullGenomes = [];
	let offspring = [];
	for (let i = 0; i < parents.length; i++) {
		let newInd = parents[i].clone();
		offspring.push(newInd);
		let fullGenome = newInd.genome.concat(newInd.hist);
		fullGenomes.push(fullGenome);
	}
	
	let offspringFullGenomes = [];
	for (let i = 0; i < numOff; i++) {
		_.shuffle(fullGenomes);
		let off = [];
		let base = [];
		if (base.length > 1) {
			base = _.sample(args[3], 1);
		} else {
			base = args[3][0];
		}
		base = base.genome.concat(base.hist);
		let rest = fullGenomes;

		for (let p = 0; p < fullGenomes[0].length; p++) {
			if (Math.random() < args[2]) {
				let par = [];
				if (rest.length > 1) {
					par = _.sample(rest, 1);
				} else {
					par = rest[0];
				}
				off.push(par[p]);
			} else {
				off.push(base[p]);
			}
		}
		offspringFullGenomes.push(off);
	}
	
	/* Set offsprings */
	for (let i = 0; i < offspringFullGenomes.length; i++) {
		let ind = offspring[i];
		ind.genome = offspringFullGenomes[i].slice(0, ind.genome.length);
		ind.hist = offspringFullGenomes[i].slice(ind.genome.length, ind.genome.length + ind.hist.length);
		offspring[i] = ind;
	}
	
	return offspring;
}

/* END OF CROSSOVER MODULES */

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




