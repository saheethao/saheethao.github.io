import * as module from './module.js';
import * as indiv from '../individual.js';

/**
 * @class Module for single objective
 * @author Sahee Thao
 * @date 03/16/2021
 */
export class ObjSingle extends module.Module {
    constructor() {
        super();
        
        // individual
        // should always work
        let valid0 = function(ind) {
            return null;
        }
        let arg0 = new module.Argument(
        'Individual', 'Individual', 'This arguement is the individual to evaluate.', 
        'Input an individual.', null, valid0
        );
        // Attribute
        // should always work?
        let valid1 = function(attr) {
            return null;
        }
        
        let arg1 = new module.Argument(
        'Attribute', 'String', 'This arguement is an attribute of an individual.', 
        'Select an attribute.', null, valid1
        );
        // Statistic
        // should always work?
        let valid2 = function(stat) {
            return null;
        }
        let arg2 = new module.Argument(
        'Statistic', 'String', 'This arguement is a statistic.', 
        'Select a statistic.', null, valid2
        );
                
        this.name = 'Single Objective';
        this.args = [arg0, arg1, arg2];
        this.description = 'Calculates the fitness of an individual for a single objective';
        this.returnDescription = 'returns number';
    }
    
    execute(curArgs) {
        // set default
        if (curArgs == null || arguments.length === 0) {
            curArgs = this.curArgs;
        }
        
        // start execute
        let ind = curArgs[0];
        let dataStr = curArgs[1];
        let statStr = curArgs[2];
        
        let gamesData = ind.getGamesData(dataStr);
        let stat = new indiv.Stat(gamesData, statStr);
        let fitness = stat.getAttr(statStr);
        ind.fitness = fitness;
        return fitness;
    }
}
/*
class ObjScaled extends Module {
    constructor() {
        this.argNames = ['ind', 'AssArray<String, number>'];
        this.argTypes = ['Individual', 'String', 'String'];
        this.desc = 'Calculates the fitness of an individual for a single objective';
        this.descReturn = 'returns Array<Individual>';
    }
    
    execute(args) {
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
}
*/
