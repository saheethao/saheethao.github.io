import * as init from './initialization2.js';
import * as cx from './crossover2.js';
import * as mut from './mutate2.js';
import * as ind from '../individual.js';
import * as play from './play.js';
import * as sel from './selection2.js';
import * as obj from './objective2.js';

// Used for keeping track of what data needs to be calculated
var dataKeys = {};
var canvasId = 'myChart';

/**
 * Used in main(). Creates chart based on datasets
 */
function createChart(datasets, popKeys, canvasId) {
    if ($('#' + canvasId)) {
        $('#' + canvasId).remove();
    }
    $('#charts').append('<canvas id="' + canvasId + '"></canvas>');
    

    let ctx = $('#' + canvasId).get(0).getContext('2d');
    let chart = new Chart(ctx, {
        type: 'line',

        data: {
            labels: popKeys,
            datasets: datasets
        },

        options: {animation : false,}
    });
    return chart;
}

// Custom event
$('#console').on('custom', function (event, g, gens, pop, archive, dataKeys, popKeys, datasets, chart) {
    handleEvolutionUpdate(g, gens, pop, archive, dataKeys, popKeys, datasets, chart);
});

function main(gens, popSize) {
    // Log out all parameters
    console.log('Generations:     ' + gens);
    console.log('Population size: ' + popSize);
    console.log('Payoffs');
    console.log('r: ' + gaPayoffs['r']);
    console.log('s: ' + gaPayoffs['s']);
    console.log('t: ' + gaPayoffs['t']);
    console.log('p: ' + gaPayoffs['p']);
    
    console.log('Initialization');
    console.log('Decision Op:');
    console.log(gaOperators['decision'].op);
    console.log('Decision Args:');
    console.log(gaOperators['decision'].args);
    console.log('History Op:');
    console.log(gaOperators['history'].op);
    console.log('History Args:');
    console.log(gaOperators['history'].args);
    
    console.log('Crossover');
    console.log('Crossover Op:');
    console.log(gaOperators['crossover'].op);
    console.log('Crossover Args:');
    console.log(gaOperators['crossover'].args);
    
    console.log('Mutation');
    console.log('Mutation Op:');
    console.log(gaOperators['mutation'].op);
    console.log('Mutation Args:');
    console.log(gaOperators['mutation'].args);
    
    console.log('Objective');
    console.log('Objective Op:');
    console.log(gaOperators['objective'].op);
    console.log('Objective Args:');
    console.log(gaOperators['objective'].args);
    
    console.log('Selection');
    console.log('Selection Op:');
    console.log(gaOperators['selection'].op);
    console.log('Selection Args:');
    console.log(gaOperators['selection'].args);
    
    
    let archive = new ind.Archive();
    let pop = initPop(popSize);
    let popKeys = [];
    let g = 0;
    
    // Prepare for evaluation
    for (let i = 0; i < pop.length; i++) {
        pop[i].resetStats();
    }
    
    // Evaluate
    play.roundRobin([pop, 150]);
    archive.addPop(g, pop);
    for (let dataKey in dataKeys) {
        archive.calculatePopDataStat(g, dataKey);
    }
    popKeys.push(g);

    let datasets = createDatasets(archive, popKeys, dataKeys);
    let chart = createChart(datasets, popKeys, canvasId);
    g++;
    
    // In order to update the chart, the event 'custom' needs to be run.
    setTimeout(
        function() {
            $('#console').trigger('custom', [g, gens, pop, archive, dataKeys, popKeys, datasets, chart]);
        }, 10);
}