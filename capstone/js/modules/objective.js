import * as Module from './modules/module.js';

/* Contains all objective modules */


/* START OF OBJECTIVE MODULES */

/*
 * Get fitness score of ind from single attr
 * args: <ind> <str of data> <str of stat>
 */
class ObjSingle extends Module {
    constructor() {
        this.argNames = ['ind', 'dataStr', 'statStr'];
        this.argTypes = ['Individual', 'number', 'number'];
        this.desc = 'Calculates the fitness of an individual for a single objective';
        this.descReturn = 'returns Array<Individual>';
    }
    
    execute(args) {
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
}
export function single(args) {
	let ind = args[0];
	let dataStr = args[1];
	let statStr = args[2];
	let fitness = 0;
	
	let gameStats = ind.gameStatList;
	for (let j = 0; j < gameStats.length; j++) {
		fitness += gameStats[j].getStat(dataStr, statStr);
	}
	return fitness;
}

/*
 * Get fitness score of ind from multiple attr
 * args: <ind> <string attr and scale associate array>
 */
export function scale(args) {
	let ind = args[0];
	let fitness = 0;
		

	for (let key in args[1]) {
		let gameStats = ind.gameStatList;
		let totalStat = 0;
		for (let j = 0; j < gameStats.length; j++) {
			totalStat += gameStats[j].getStat(key);
		}
		fitness += totalStat * args[1][key];
	}
	
	return fitness;
}

/* END OF OBJECTIVE MODULES */

export class ModuleManager {
	constructor() {
		this.map = {
			'single': single,
			'scale': scale,
		};
	}
	
	getModule(name) {
		return this.map[name];
	}
}




