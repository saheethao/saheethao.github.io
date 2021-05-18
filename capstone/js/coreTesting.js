import * as ind from './individual.js';
import * as init from './modules/initialization2.js';
import * as mut from './modules/mutate2.js';
import * as cx from './modules/crossover2.js';




function main() {
    let cxOperator = new cx.CxNPoint();
    let mutOperator = new mut.MutChanceFlip();    


    let popSize = 2;
    for (let i = 0; i < popSize; i++) {
        let individual = new ind.Individual();
        individual.setPayoffs(3, 0, 5, 1);
    
        let initRandom = new init.InitRandom();
        individual.setGenome(initRandom.execute([64]));
    
        individual.setHist(initRandom.execute([6]));

        pop.push(individual);
    }    
    console.log(pop);

    
    let offspring = null;
    offspring = cxOperator.execute([pop, 2, 1, 1]);
    offspring = mutOperator.execute([offspring, 1/70, 1]);
    

}

function go() {
    console.log('go');
}

window.main = main;
window.go = go;