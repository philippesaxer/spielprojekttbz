import { Game } from './game.js';
import { setupUI } from './ui.js';

const canvas = document.getElementById('game');
const ui = setupUI();

const game = new Game(canvas, ui);

ui.onStart(() => game.start());
ui.onRetry(() => game.reset());
