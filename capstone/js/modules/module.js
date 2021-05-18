export class Module {
    constructor() {
        this.name = 'This is the deafult name';
        this.args = [];
        this.description = 'This is the default description';
        this.returnDescription = 'This is the default returnDescription';
        this.curArgs = null;
    }
    
    getName() {
        return this.name;
    }
    
    setCurArgs(curArgs) {
        this.curArgs = curArgs;
    }
    
    getCurArgs() {
        return this.curArgs;
    }
    
    getArgsDesc() {
        let output = 'Args: ';
        for (let i = 0; i < this.args.length; i++) {
            output += this.args[i].toString();
        }
        return output;
    }
    
    getArgs() {
        return this.args;
    }
    
    getArgsDescArr() {
        let output = [];
        for (let i = 0; i < this.args.length; i++) {
            output.push(this.args[i].toString());
        }
        return output;
    }
    
    getDesc() {
        return this.description;
    }
    
    getReturnDesc() {
        return this.returnDescription;
    }

    validate(curArgs) {
        for (let i = 0; i < this.args.length; i++) {
            if (!curArgs[i]) {
                return {arg: this.args[i].name, msg: 'The value is empty.'};
            }
            let error = this.args[i].validationFunction(curArgs[i]);
            if (error != null) {
                return {arg: this.args[i].name, msg: error};
            }
        }
        return null;
    }
    
    toArgsArr(object) {
        let newArgs = [];
        for (let i = 0; i < this.args.length; i++) {
            let val = object[this.args[i].name];
            if (this.args[i].type == 'Integer' || this.args[i].type == 'Number') {
                val = Number.parseFloat(val);
            } else {
                console.log('arg ' + this.args[i].name + ' is NOT a number or integer.');
            }
            newArgs.push(val);
        }
        return newArgs;
    }
    
    execute(curArgs) {
        return null;
    }
}

export class Argument {
    constructor(name, type, description, validationDescription, defaultValue, validationFunction) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.defaultValue = defaultValue;
        this.validationDescription = validationDescription;
        this.validationFunction = validationFunction; // validation must take in the type and must return a String or null. String indicates the error message
    }
    
    toString() {
        return '{' + this.type + '} ' + this.name + ' - ' + this.description;
    }
}