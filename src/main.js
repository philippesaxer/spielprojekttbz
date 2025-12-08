import { Game } from './game.js';
import { setupUI } from './ui.js';
import { loadAssets } from './assets.js';

const canvas = document.getElementById('game');
const ui = setupUI();

let game = null;

async function init() {
  const assets = await loadAssets(window.THREE); 

  const game = new Game(canvas, ui, assets); 

  ui.onStart(() => game.start());
  ui.onRetry(() => game.reset());
}

init();

