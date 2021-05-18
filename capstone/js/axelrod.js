import * as strat from './strategy.js';

export class AlwaysCooperate extends strat.Strategy {
    init() {
        this.name = 'Always Cooperate';
    }
    
    generateMove() {
        return 0;
    }
    
    getDescription() {
        return 'Always chooses cooperate.';
    }
}

export class AlwaysDefect extends strat.Strategy {
    init() {
        this.name = 'Always Defect';
    }
    
    generateMove() {
        return 1;
    }
    
    getDescription() {
        return 'Always chooses defect.';
    }
}

export class InvertedTitForTat extends strat.Strategy {
    init() {
        this.name = 'Inverted Tit for Tat';
    }
    
    generateMove() {
		if (this.oppHistory.length == 0) {
			return 1;
		}
        if (this.oppHistory[this.oppHistory.length - 1] === 1) {
            return 0;
        } else {
            return 1;
        }
    }
    
    getDescription() {
        return 'Behaves like Tit for Tat but its choice is inverted.';
    }
}

export class TitForTat extends strat.Strategy {
    init() {
        this.name = 'Tit for Tat';
    }
    generateMove() {
		if (this.oppHistory.length == 0) {
			return 0;
		}
		return this.oppHistory[this.oppHistory.length - 1];
    }
    getDescription() {
        return 'Always chooses to cooperate first. Then replies with their opponent\'s last move.';
    }
}

export class TitForTwoTats extends strat.Strategy {
    init() {
        this.name = 'Tit for Two Tats';
    }
    generateMove() {
		if (this.oppHistory.length <= 1) {
			return 0;
		}
        
        if (this.oppHistory[this.oppHistory.length - 1] == 1 && this.oppHistory[this.oppHistory.length - 2] == 1) {
            return 1;
        }
        
		return 0;
    }
    
    getDescription() {
        return 'Always chooses to cooperate the first two rounds. Defects if the last two moves by their opponent were defect.';
    }
}

export class Random extends strat.Strategy {
    init() {
        this.name = 'Random';
    }
    
    generateMove() {
		return Math.round(Math.random());
    }
    
    getDescription() {
        return 'Randomly chooses to defect or cooperate.';
    }
}

export class HardMajority extends strat.Strategy {
    init() {
        this.numC = 0;
        this.numD = 0;
        this.name = 'Hard Majority';
    }
    
    reinit() {
        this.numC = 0;
        this.numD = 0;
    }
    generateMove() {
        if (this.oppHistory.length == 0) {
			return 1;
		}
        let oppMove = this.oppHistory[this.oppHistory.length - 1];
        
        if (oppMove == 1) {
            this.numD += 1;
        } else {
            this.numC += 1;
        }
        if (this.numD >= this.numC) {
            return 1;
        } else {
            return 0;
        }
    }
    
    getDescription() {
        return 'Only cooperates if the opponent has cooperated more than they have defected.';
    }
}

export class SoftMajority extends strat.Strategy {
    init() {
        this.numC = 0;
        this.numD = 0;
        this.name = 'Soft Majority';
    }
    
    reinit() {
        this.numC = 0;
        this.numD = 0;
    }
    generateMove() {
        if (this.oppHistory.length == 0) {
			return 0;
		}
        let oppMove = this.oppHistory[this.oppHistory.length - 1];
        
        if (oppMove == 1) {
            this.numD += 1;
        } else {
            this.numC += 1;
        }
        if (this.numD > this.numC) {
            return 1;
        } else {
            return 0;
        }
    }
    
    getDescription() {
        return 'Only defects if the opponent has defected more than they have cooperated.';
    }
}

export class Grim extends strat.Strategy {
    init() {
        this.betrayed = 0;
        this.name = 'Grim';
    }
    
    reinit() {
        this.betrayed = 0;
    }
    
    generateMove() {
        if (this.betrayed === 1) {
            return 1;
        }
		if (this.oppHistory.length == 0) {
			return 0;
		}
        let oppMove = this.oppHistory[this.oppHistory.length - 1];
        
        if (oppMove == 1) {
            this.betrayed = 1;
        }
        if (this.betrayed === 1) {
            return 1;
        }
		return 0;
    }
    
    getDescription() {
        return 'Always cooperates unless the opponent has defected. Then it only defects.';
    }
}