import { Game } from './game.js';
import { setupUI } from './ui.js';
import { loadAssets } from './assets.js';

const canvas = document.getElementById('game');
const ui = setupUI();

const game = new Game(canvas, ui);
async function init() {
  const assets = await loadAssets(window.THREE); 

  const game = new Game(canvas, ui, assets); // Assets an Game übergeben

  ui.onStart(() => game.start());
  ui.onRetry(() => game.reset());
}

init();

