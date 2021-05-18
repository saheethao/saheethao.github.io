import * as module from './module.js';

/*
class SelNone extends Module {
    constructor() {
        this.argNames = ['pop'];
        this.argTypes = ['Array<Individual>'];
        this.desc = 'Simply returns to population';
        this.descReturn = 'returns Array<Array<Individual>,Array<Individual>>';
    }
    
    execute(args) {
        let pop = args[0];
        return [pop, []];
    }
}

class SelRandom extends Module {
    constructor() {
        this.argNames = ['pop', 'num'];
        this.argTypes = ['Array<Individual>', 'integer'];
        this.desc = 'Select \'num\' random individuals';
        this.descReturn = 'returns Array<Array<Individual>,Array<Individual>>';
    }
    
    execute(args) {
        let pop = args[0];
        let num = args[1];

        let shuffled = _.shuffle(pop);
        return [shuffled.slice(0, num), shuffled.slice(num, shuffled.length)];
    }
}

class SelTourBest extends Module {
    constructor() {
        this.argNames = ['pop', 'num', 'objMod', 'objArgs', 'size'];
        this.argTypes = ['Array<Individual>', 'integer', 'Module (Objective)', 'Array<?>', 'integer'];
        this.desc = 'Select \'num\' individuals using tournament selection (maximizing an objective)';
        this.descReturn = 'returns Array<Array<Individual>,Array<Individual>>';
    }
    
    execute(args) {
        let pop = args[0];
        let num = args[1];
        let objMod = args[2];
        let objArgs = args[3];
        let tourn = _.shuffle(pop);
        tourn = tourn.slice(0, args[4]);
        tourn.sort(
            function(a, b) { 
                return objMod(b, objArgs) - objMod(a, objArgs); //TODO: FIX
            }
        );
        return [tourn.slice(0, num), tourn.slice(num, shuffled.length)];
    }
}

class SelTourWorst extends Module {
    constructor() {
        this.argNames = ['pop', 'num', 'objMod', 'objArgs', 'size'];
        this.argTypes = ['Array<Individual>', 'integer', 'Module (Objective)', 'Array<?>', 'integer'];
        this.desc = 'Select \'num\' individuals using tournament selection (minimizing an objective)';
        this.descReturn = 'returns Array<Array<Individual>,Array<Individual>>';
    }
    
    execute(args) {
        let pop = args[0];
        let num = args[1];
        let objMod = args[2];
        let objArgs = args[3];
        let tourn = _.shuffle(pop);
        tourn = tourn.slice(0, args[4]);
        tourn.sort(
            function(a, b) { 
                return objMod(a, objArgs) - objMod(b, objArgs); //TODO: FIX
            }
        );
        return [tourn.slice(0, num), tourn.slice(num, shuffled.length)];
    }
}
*/

/*
 * Get numSelect individuals using stochastic acceptance (MAX)
 * args: <indArr> <numSelect> <objMod> <objArgs>
 */

/*
 * Get numSelect individuals using stochastic acceptance (MIN)
 * args: <indArr> <numSelect> <objMod> <objArgs>
 */
/*
export function accpetanceWorst(args) {
	let indArr = args[0];
	let numSelect = args[1];
	let objMod = args[2];
	let objArgs = args[3];
	indArr.sort(
		function(a, b) { 
			return objMod(b, objArgs) - objMod(a, objArgs);
		}
	);
	let bestFit = objMod(indArr[0], objArgs);
	
	let selectedInds = [];
	
	for (let i = 0; i < numSelect; i++) {
		let isAccepted = false;
		let selectedInd = null;
		while(!isAccepted) {
			let shuffled = _.shuffle(indArr);
			selectedInd = shuffled[0];
			let curFitness = objMod(selectedInd, objArgs);
			let prob = curFitness / bestFit;
			if (!(Math.random() < prob)) {
				isAccepted = true;
				
			}
		}
		selectedInds.push(selectedInd);
		selectedInds.push(selectedInd);
	}
	
	return [selectedInds, shuffled];
}
*/


/**
 * @class Module for select max
 * @author Sahee Thao
 * @date 03/16/2021
 */
export class SelMax extends module.Module {
    constructor() {
        super();
        
        // pop
        // should always work
        let valid0 = function(pop) {
            return null;
        }
        let arg0 = new module.Argument(
        'Population', 'Array<Individual>', 'This arguement is the population to select from.', 
        'Input an array of individuals.', [], valid0
        );
        
        
        // number
        let valid1 = function(number) {
            if (Number.isInteger(number)) {
                if (1 <= number) {
                    return null;
                } else {
                    return 'Input must be a number greater than 0.';
                }
            } else {
                return 'Input must be an integer.';
            }
        }
        
        let arg1 = new module.Argument(
        'Number', 'Number', 'This arguement is the number of individuals to select.', 
        'Input a number greater than 0.', 1, valid1
        );
        
        // objMod
        // should always work
        let valid2 = function(objMod) {
            return null;
        }
        
        let arg2 = new module.Argument(
        'Objective Module', 'Objective', 'This arguement is the objective module', 
        'An objective module', null, valid2
        );
        
        // objArr
        // should always work
        let valid3 = function(objMod) {
            return null;
        }
        
        let arg3 = new module.Argument(
        'Objective Module Arguments', 'Array<?>', 'This arguement is the objective module arguements', 
        'The objective module\'s arguements', [], valid3
        );
        
        
        
        //this.argNames = ['pop', 'num', 'objMod', 'objArgs'];
        //this.argTypes = ['Array<Individual>', 'integer', 'Module (Objective)', 'Array<?>'];
        
        this.name = 'Maximize';
        this.args = [arg0, arg1, arg2, arg3];
        this.description = 'Select \'Number\' individuals based on maximizing an objective';
        this.returnDescription = 'returns Array<Array<Individual>,Array<Individual>>';
    }
    
    execute(curArgs) {
        let pop = curArgs[0];
        let num = curArgs[1];
        let objMod = curArgs[2];
        let objArgs = curArgs[3];
        pop.sort(
            function(a, b) {
                let objArgsA = _.cloneDeep(objArgs);
                objArgsA[0] = a;
                let objArgsB = _.cloneDeep(objArgs);
                objArgsB[0] = b;
                return objMod.execute(objArgsB) - objMod.execute(objArgsA);
            }
        );
	
        return [pop.slice(0, num), pop.slice(num, pop.length)];
    }
}

/**
 * @class Module for select min
 * @author Sahee Thao
 * @date 03/26/2021
 */
export class SelMin extends module.Module {
    constructor() {
        super();
        
        // pop
        // should always work
        let valid0 = function(pop) {
            return null;
        }
        let arg0 = new module.Argument(
        'Population', 'Array<Individual>', 'This arguement is the population to select from.', 
        'Input an array of individuals.', [], valid0
        );
        
        
        // number
        let valid1 = function(number) {
            if (Number.isInteger(number)) {
                if (1 <= number) {
                    return null;
                } else {
                    return 'Input must be a number greater than 0.';
                }
            } else {
                return 'Input must be an integer.';
            }
        }
        
        let arg1 = new module.Argument(
        'Number', 'Number', 'This arguement is the number of individuals to select.', 
        'Input a number greater than 0.', 1, valid1
        );
        
        // objMod
        // should always work
        let valid2 = function(objMod) {
            return null;
        }
        
        let arg2 = new module.Argument(
        'Objective Module', 'Objective', 'This arguement is the objective module', 
        'An objective module', null, valid2
        );
        
        // objArr
        // should always work
        let valid3 = function(objMod) {
            return null;
        }
        
        let arg3 = new module.Argument(
        'Objective Module Arguments', 'Array<?>', 'This arguement is the objective module arguements', 
        'The objective module\'s arguements', [], valid3
        );
        
        
        
        //this.argNames = ['pop', 'num', 'objMod', 'objArgs'];
        //this.argTypes = ['Array<Individual>', 'integer', 'Module (Objective)', 'Array<?>'];
        
        this.name = 'Minimize';
        this.args = [arg0, arg1, arg2, arg3];
        this.description = 'Select \'Number\' individuals based on minimizing an objective';
        this.returnDescription = 'returns Array<Array<Individual>,Array<Individual>>';
    }
    
    execute(curArgs) {
        let pop = curArgs[0];
        let num = curArgs[1];
        let objMod = curArgs[2];
        let objArgs = curArgs[3];
        pop.sort(
            function(a, b) {
                let objArgsA = _.cloneDeep(objArgs);
                objArgsA[0] = a;
                let objArgsB = _.cloneDeep(objArgs);
                objArgsB[0] = b;
                return objMod.execute(objArgsA) - objMod.execute(objArgsB);
            }
        );
	
        return [pop.slice(0, num), pop.slice(num, pop.length)];
    }
}

/**
 * @class Module for select min
 * @author Sahee Thao
 * @date 03/26/2021
 */
export class SelRandom extends module.Module {
    constructor() {
        super();
        
        // pop
        // should always work
        let valid0 = function(pop) {
            return null;
        }
        let arg0 = new module.Argument(
        'Population', 'Array<Individual>', 'This arguement is the population to select from.', 
        'Input an array of individuals.', [], valid0
        );
        
        
        // number
        let valid1 = function(number) {
            if (Number.isInteger(number)) {
                if (1 <= number) {
                    return null;
                } else {
                    return 'Input must be a number greater than 0.';
                }
            } else {
                return 'Input must be an integer.';
            }
        }
        
        let arg1 = new module.Argument(
        'Number', 'Number', 'This arguement is the number of individuals to select.', 
        'Input a number greater than 0.', 1, valid1
        );
        
        // objMod
        // should always work
        let valid2 = function(objMod) {
            return null;
        }
        
        let arg2 = new module.Argument(
        'Objective Module', 'Objective', 'This arguement is the objective module', 
        'An objective module', null, valid2
        );
        
        // objArr
        // should always work
        let valid3 = function(objMod) {
            return null;
        }
        
        let arg3 = new module.Argument(
        'Objective Module Arguments', 'Array<?>', 'This arguement is the objective module arguements', 
        'The objective module\'s arguements', [], valid3
        );
        
        
        
        //this.argNames = ['pop', 'num', 'objMod', 'objArgs'];
        //this.argTypes = ['Array<Individual>', 'integer', 'Module (Objective)', 'Array<?>'];
        
        this.name = 'Random';
        this.args = [arg0, arg1, arg2, arg3];
        this.description = 'Select \'Number\' random individual(s)';
        this.returnDescription = 'returns Array<Array<Individual>,Array<Individual>>';
    }
    
    execute(args) {
        let pop = args[0];
        let num = args[1];

        let shuffled = _.shuffle(pop);
        return [shuffled.slice(0, num), shuffled.slice(num, shuffled.length)];
    }
}