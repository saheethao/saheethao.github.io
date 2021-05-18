import * as module from './module.js';
import * as ind from '../individual.js'

/**
 * @class Module for crossover npoint
 * @author Sahee Thao
 * @date 03/16/2021
 */
export class CxNPoint extends module.Module {
    constructor() {
        super();
        
        // pop
        // should always work
        let valid0 = function(pop) {
            return null;
        }
        let arg0 = new module.Argument(
        'Population', 'Array<Individual>', 'This arguement is the population to crossover.', 
        'Input an array of individuals.', [], valid0
        );
        
        // number of offspring
        let valid1 = function(numberOfOffspring) {
            if (Number.isInteger(numberOfOffspring)) {
                if (numberOfOffspring > 0) {
                    return null;
                } else {
                    return 'Input must be an integer greater than 0.';
                }
            } else {
                return 'Input must be an integer.';
            }
        }
        //    constructor(name, type, description, validationDescription, defaultValue, validationFunction
        let arg1 = new module.Argument(
        'Number of Offspring', 'Integer', 'This arguement specifies the number of offspring to produce.', 
        'Input an integer greater than 1', [], valid1
        );
        
        // number
        let valid2 = function(number) {
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
        
        let arg2 = new module.Argument(
        'Number', 'Integer', 'This arguement is the number of points to pick to crossover.', 
        'Input a number from 1 to 70.', [], valid2
        );
        
        // rate
        /*
        let valid3 = function(rate) {
            if (0 <= rate && rate <= 1) {
                return null;
            }
            return 'Input must be between 0 and 1 (inclusive).'
        }
        let arg3 = new module.Argument(
        'Rate', 'Number', 'This arguement is the chance for the operator to apply to an individual.', 
        'Input a number from 0 to 1 (inclusive).', [], valid3
        );
        */
        this.name = 'n-point';
        this.args = [arg0, arg1, arg2];
        this.description = 'Creates offspring using npoint crossover.';
        this.returnDescription = 'returns Array<Individual>';
    }
    
    execute(curArgs) {
        // set parents
        let parents = curArgs[0];
        
        // set number of offspring
        let numOff = curArgs[1];
        
        // array of bits (the full genome) of pop
        let fullGenomes = [];
        
        // a copy of pop
        let offspring = [];
        for (let i = 0; i < parents.length; i++) {
            let fullGenome = parents[i].genome.concat(parents[i].hist);
            fullGenomes.push(fullGenome);
        }
	
        let offspringFullGenomes = [];
        
        // For each new child
        for (let i = 0; i < numOff; i++) {
            // create list of numbers from 1 to length - 1 and then shuffle the list
            let positions = _.shuffle(_.range(1, fullGenomes[0].length - 1));
            
            // gather all of the points where the genome will split
            let points = positions.slice(0, curArgs[2]);
            points.push(0);
            points.push(fullGenomes[0].length);
            points.sort();
            
            // shuffle the array of genomes
            _.shuffle(fullGenomes);
            
            // create a new genome in accordance to npoint
            let off = [];
            for (let p = 0; p < points.length; p++) {
                // Get points
                let pointStart = points[p];
                let pointEnd = points[p + 1];
                // Get parent
                let g = fullGenomes[p % fullGenomes.length];
                off = off.concat(g.slice(pointStart, pointEnd));
            }
            
            // add these new offspring
            offspringFullGenomes.push(off);
            
            let indiv = new ind.Individual();
            indiv.setGenome(offspringFullGenomes[i].slice(0, parents[0].genome.length));
            indiv.setHist(offspringFullGenomes[i].slice(parents[0].genome.length, parents[0].genome.length + parents[0].hist.length));
            indiv.setPayoffs(
            parents[0].getPayoff('r'), 
            parents[0].getPayoff('s'),
            parents[0].getPayoff('t'), 
            parents[0].getPayoff('p'))
            offspring.push(indiv);
        }
	
        return offspring;
    }
}
/*
class CxChance extends Module {
    constructor() {
        this.argNames = ['parents', 'numOff', 'chance', 'rate'];
        this.argTypes = ['Array<Individual>', 'integer', 'number', 'number'];
        this.desc = 'Creates offspring using a random parent as a base parent and the others as genetic additions';
        this.descReturn = 'returns Array<Individual>';
    }
    
    execute(args) {
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
	
        for (let i = 0; i < offspring.length; i++) {
            let ind = offspring[i];
            ind.genome = offspringFullGenomes[i].slice(0, ind.genome.length);
            ind.hist = offspringFullGenomes[i].slice(ind.genome.length, ind.genome.length + ind.hist.length);
            offspring[i] = ind;
        }
        return offspring;
    }
}


class CxBase extends Module {
    constructor() {
        this.argNames = ['parents', 'numOff', 'chance', 'rate'];
        this.argTypes = ['Array<Individual>', 'integer', 'number', 'number'];
        this.desc = 'Creates offspring using a random parent as a base parent and the others as genetic additions';
        this.descReturn = 'returns Array<Individual>';
    }
    
    execute(args) {
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
	
        for (let i = 0; i < offspring.length; i++) {
            let ind = offspring[i];
            ind.genome = offspringFullGenomes[i].slice(0, ind.genome.length);
            ind.hist = offspringFullGenomes[i].slice(ind.genome.length, ind.genome.length + ind.hist.length);
            offspring[i] = ind;
        }
        return offspring;
    }
}

class CxChanceBase extends Module {
    constructor() {
        this.argNames = ['parents', 'numOff', 'chance', 'bases', 'rate'];
        this.argTypes = ['Array<Individual>', 'integer', 'number', 'Array<Individual>', 'number'];
        this.desc = 'Creates offspring using a random parent as a base parent and the others as genetic additions';
        this.descReturn = 'returns Array<Individual>';
    }
    
    execute(args) {
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
	
        for (let i = 0; i < offspringFullGenomes.length; i++) {
            let ind = offspring[i];
            ind.genome = offspringFullGenomes[i].slice(0, ind.genome.length);
            ind.hist = offspringFullGenomes[i].slice(ind.genome.length, ind.genome.length + ind.hist.length);
            offspring[i] = ind;
        }
	
        return offspring;
    }
}
*/