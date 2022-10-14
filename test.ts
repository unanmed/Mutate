import * as mutate from 'mutate-game';

const game = mutate.create(document.createElement('canvas'));

game.chart.register('generator', 'aaa', () => () => 1);