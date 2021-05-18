import * as module from './module.js';


/**
 * @class Module for random initialization
 * @author Sahee Thao
 * @date 02/25/2021
 */
export class InitRandom extends module.Module {
    constructor() {
        super();
        let valid0 = function(length) {
            if (Number.isInteger(length)) {
                if (length > 0) {
                    return null;
                } else {
                    return 'Input must be larger than 0.';
                }
            } else {
                return 'Input must be an integer.';
            }
        }
        let arg0 = new module.Argument(
        'Length', 'Integer', 'This arguement defines how long of an array to create.', 
        'Input an integer greater than 0.', 64, valid0
        );
        
        this.name = 'Random';
        this.args = [arg0];
        this.description = 'Creates an array with random 0s or 1s.';
        this.returnDescription = 'returns Array<0 or 1>.';
    }
    
    execute(curArgs) {
        if (curArgs == null || arguments.length === 0) {
            curArgs = this.curArgs;
        }
        let length = curArgs[0];
        let chromosome = [];
	
        for (let i = 0; i < length; i++) {
            chromosome.push(_.random(0, 1));
        }
	
        return chromosome;
    }
}

/**
 * @class Module for pattern initialization
 * @author Sahee Thao
 * @date 02/25/2021
 */
export class InitPattern extends module.Module {
    constructor() {
        super();
        
        let valid0 = function(length) {
            if (Number.isInteger(length)) {
                if (length > 0) {
                    return null;
                } else {
                    return 'Input must be larger than 0.';
                }
            } else {
                return 'Input must be an integer.';
            }
        }
        
        let valid1 = function(pattern) {
            if (typeof pattern === 'string') {
                for (let i = 0; i < pattern.length; i++) {
                    if (pattern[i] == '1' || pattern[i] == '0') {
                        
                    } else {
                        return 'Input must only contain 0 or 1.';
                    }
                }
            } else {
                return 'Input must be a String.';
            }
            return null;
        }
        
        let arg0 = new module.Argument(
        'Length', 'Integer', 'This arguement defines how long of an array to create.', 
        'Input an integer greater than 0.', 64, valid0
        );
        
        let arg1 = new module.Argument(
        'Pattern', 'String of 0s and 1s', 'This arguement defines what the pattern of an array to create.', 
        'Input a pattern containing only of 0s and 1s.', '01', valid1
        );
        
        this.name = 'Pattern';
        this.args = [arg0, arg1];
        this.description = 'Creates an array based on a string of 0s or 1s.';
        this.returnDescription = 'returns Array<0 or 1>.';
    }
    
    execute(args) {
        if (args == null || arguments.length === 0) {
            args = this.args;
        }
        let length = args[0];
        let chromosome = [];
	
        for (let i = 0; i < length; i++) {
            let j = i % args[1].length;
            let c = args[1].charAt(j);
            chromosome.push(parseInt(c));	
        }
	
        return chromosome;
    }
}
