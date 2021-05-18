import * as module from './module.js';

/**
 * @class Module for chance flip
 * @author Sahee Thao
 * @date 03/16/2021
 */
export class MutChanceFlip extends module.Module {
    constructor() {
        super();
        // should always work
        let valid0 = function(pop) {
            return null;
        }
        let arg0 = new module.Argument(
        'Population', 'Array<Individual>', 'This arguement is the population to mutate.', 
        'Input an array of individuals.', [], valid0
        );
        
        let valid1 = function(chance) {
            if (0 <= chance && chance <= 1) {
                return null;
            }
            return 'Input must be between 0 and 1 (inclusive)';
        }
        
        let arg1 = new module.Argument(
        'Chance', 'Number', 'This arguement is the chance for each bit to flip.', 
        'Input a number from 0 to 1 (inclusive).', [], valid1
        );
        
        let valid2 = function(rate) {
            if (0 <= rate && rate <= 1) {
                return null;
            }
            return 'Input must be between 0 and 1 (inclusive).'
        }
        let arg2 = new module.Argument(
        'Rate', 'Number', 'This arguement is the chance for the operator to apply to an individual.', 
        'Input a number from 0 to 1 (inclusive).', [], valid2
        );
        
        this.name = 'Chance Bit Flip';
        this.args = [arg0, arg1, arg2];
        this.description = 'Creates a mutated copy of pop by having a chance of flipping each bit for each individual based on \'chance\'';
        this.returnDescription = 'returns Array<Individual>';
    }
    
    execute(curArgs) {
        if (curArgs == null || arguments.length === 0) {
            curArgs = this.curArgs;
        }
        let mutpop = [];
        let pop = curArgs[0];
        for (let idx = 0; idx < pop.length; idx++) {
            let mutInd = pop[idx].clone();
            if (Math.random() < curArgs[2]) {
	
                let fullGenome = mutInd.genome.concat(mutInd.hist);
		
                for (let i = 0; i < fullGenome.length; i++) {
                    if (Math.random() < curArgs[1]) {
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

/**
 * @class Module for set flip
 * @author Sahee Thao
 * @date 03/16/2021
 */
export class MutSetFlip extends module.Module {
    constructor() {
        super();
        
        // pop
        // should always work
        let valid0 = function(pop) {
            return null;
        }
        let arg0 = new module.Argument(
        'Population', 'Array<Individual>', 'This arguement is the population to mutate.', 
        'Input an array of individuals.', [], valid0
        );
        // number
        let valid1 = function(number) {
            if (Number.isInteger(number)) {
                if (1 <= number && number <= 70) {
                    return null;
                } else {
                    return 'Input must be an integer between 1 and 70 (inclusive).';
                }
            } else {
                return 'Input must be an integer.';
            }
        }
        
        let arg1 = new module.Argument(
        'Number', 'Number', 'This arguement is the number of bits to flip.', 
        'Input a number from 1 to 70.', [], valid1
        );
        // rate
        let valid2 = function(rate) {
            if (0 <= rate && rate <= 1) {
                return null;
            }
            return 'Input must be between 0 and 1 (inclusive).';
        }
        let arg2 = new module.Argument(
        'Rate', 'Number', 'This arguement is the chance for the operator to apply to an individual.', 
        'Input a number from 0 to 1 (inclusive).', [], valid2
        );
        
        this.name = 'Set Bit Flip';
        this.args = [arg0, arg1, arg2];
        this.description = 'Creates a mutated copy of pop where \'num\' bits are flipped for each individual';
        this.returnDescription = 'returns Array<Individual>';
    }
    
    execute(curArgs) {
        if (curArgs == null || arguments.length === 0) {
            curArgs = this.curArgs;
        }
        let mutpop = [];
        let pop = curArgs[0];
        for (let idx = 0; idx < pop.length; idx++) {
            let mutInd = pop[idx].clone();

            if (Math.random() < curArgs[2]) {	
                let fullGenome = mutInd.genome.concat(mutInd.hist);
	
                let positions = _.shuffle(_.range(fullGenome.length));
                for (let i = 0; i < curArgs[1]; i++) {
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
}

export class MutSwap extends module.Module {
    constructor() {
        super();
        
        // pop
        // should always work
        let valid0 = function(pop) {
            return null;
        }
        let arg0 = new module.Argument(
        'Population', 'Array<Individual>', 'This arguement is the population to mutate.', 
        'Input an array of individuals.', [], valid0
        );
        // number
        let valid1 = function(number) {
            if (Number.isInteger(number)) {
                if (1 <= number && number <= 35) {
                    return null;
                } else {
                    return 'Input must be an integer between 1 and 35 (inclusive).';
                }
            } else {
                return 'Input must be an integer.';
            }
        }
        
        let arg1 = new module.Argument(
        'Number', 'Number', 'This arguement is the number of bits to swap.', 
        'Input a number from 1 to 35.', [], valid1
        );
        // rate
        let valid2 = function(rate) {
            if (0 <= rate && rate <= 1) {
                return null;
            }
            return 'Input must be between 0 and 1 (inclusive).';
        }
        let arg2 = new module.Argument(
        'Rate', 'Number', 'This arguement is the chance for the operator to apply to an individual.', 
        'Input a number from 0 to 1 (inclusive).', [], valid2
        );
        
        this.name = 'Bit Swap';
        this.args = [arg0, arg1, arg2];
        this.description = 'Creates a mutated copy of pop where \'num\' bits are swapped for each individual';
        this.returnDescription = 'returns Array<Individual>';
    }
    
    execute(args) {
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
}

/*
export class MutSetFlip extends module.Module {
    constructor() {
        super();
        this.argNames = ['pop', 'num', 'rate'];
        this.argTypes = ['Array<Individual>', 'integer', 'number'];
        this.desc = 'Creates a mutated copy of pop where \'num\' bits are flipped for each individual';
        this.descReturn = 'returns Array<Individual>';
    }
    
    execute(args) {
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
}

export class MutSwap extends module.Module {
    constructor() {
        super();
        this.argNames = ['pop', 'num', 'rate'];
        this.argTypes = ['Array<Individual>', 'integer', 'number'];
        this.desc = 'Creates a mutated copy of pop where \'num\' bits are swapped for each individual';
        this.descReturn = 'returns Array<Individual>';
    }
    
    execute(args) {
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
}
*/