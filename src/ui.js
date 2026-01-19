export function setupUI() {
  const start = document.getElementById('start');
  const hud = document.getElementById('hud');
  const pause = document.getElementById('pause');
  const gameover = document.getElementById('gameover');

  const damageOverlay = document.createElement('div');
  damageOverlay.className = 'damage-flash';
  document.body.appendChild(damageOverlay);
  
  const startBtn = document.getElementById('startBtn');
  const retryBtn = document.getElementById('retryBtn');

  const health = document.getElementById('health');
  const ammo = document.getElementById('ammo');
  const score = document.getElementById('score');
  const bots = document.getElementById('bots');
  const finalScore = document.getElementById('finalScore');

  const listeners = { start: [], retry: [] };

  startBtn.addEventListener('click', () => listeners.start.forEach(fn => fn()));
  retryBtn.addEventListener('click', () => listeners.retry.forEach(fn => fn()));

  return {
    onStart(fn) { listeners.start.push(fn); },
    onRetry(fn) { listeners.retry.push(fn); },

    showStart(v) { start.classList.toggle('hidden', !v); },
    showHUD(v) { hud.classList.toggle('hidden', !v); },
    showPause(v) { pause.classList.toggle('hidden', !v); },
    showGameOver(v, s = 0) {
      gameover.classList.toggle('hidden', !v);
      finalScore.textContent = `Score: ${s}`;
    },

    setHealth(v) { health.textContent = `HP: ${Math.max(0, Math.floor(v))}`; },
    setAmmo(v) { ammo.textContent = `Spritzen: ${v}`; },
    setScore(v) { score.textContent = `Score: ${v}`; },
    setBots(v) { bots.textContent = `Bots: ${v}`; }
  };
}
