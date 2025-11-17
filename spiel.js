// The Gooners – Minimal 3D Shooter mit Bots
const canvas = document.getElementById('game');
const statsEl = document.getElementById('stats');
const startBtn = document.getElementById('startBtn');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e14);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 1.7, 5);

// Licht
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 2);
dir.castShadow = true;
scene.add(dir);

// Boden
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x1c2a3a, roughness: 0.9, metalness: 0.0 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Spieler-Kapsel (unsichtbare Kollision)
const player = {
  velocity: new THREE.Vector3(),
  speed: 6.0,
  sprint: 3.0,
  position: new THREE.Vector3(0, 1.7, 0),
  health: 100,
  score: 0
};

// Controls (Pointer Lock)
const controls = new THREE.PointerLockControls(camera, document.body);
scene.add(controls.getObject());

startBtn.addEventListener('click', () => {
  controls.lock();
});

// UI ausblenden bei Lock
controls.addEventListener('lock', () => {
  document.getElementById('ui').style.display = 'none';
});
controls.addEventListener('unlock', () => {
  document.getElementById('ui').style.display = 'block';
});

// Gegner (Bots)
const bots = [];
const botGeo = new THREE.SphereGeometry(0.4, 16, 16);
const botMat = new THREE.MeshStandardMaterial({ color: 0xd1495b, roughness: 0.6 });

function spawnBot() {
  const r = 40;
  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  const bot = new THREE.Mesh(botGeo, botMat);
  bot.castShadow = true;
  bot.position.set(x, 0.4, z);
  bot.userData = { alive: true, speed: 2 + Math.random() * 1.5 };
  scene.add(bot);
  bots.push(bot);
}

// Hindernisse fürs Gefühl
const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshStandardMaterial({ color: 0x5b8def });
for (let i = 0; i < 12; i++) {
  const b = new THREE.Mesh(boxGeo, boxMat);
  b.castShadow = true;
  b.receiveShadow = true;
  b.position.set((Math.random() - 0.5) * 80, 1, (Math.random() - 0.5) * 80);
  scene.add(b);
}

// Projektile
const bullets = [];
const bulletGeo = new THREE.SphereGeometry(0.12, 12, 12);
const bulletMat = new THREE.MeshStandardMaterial({ color: 0x8fd14f, emissive: 0x103010, emissiveIntensity: 0.8 });

function shoot() {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);
  bullet.castShadow = true;
  bullet.position.copy(camera.position).add(dir.clone().multiplyScalar(0.5));
  bullet.userData = { velocity: dir.multiplyScalar(28), life: 2.0 };
  scene.add(bullet);
  bullets.push(bullet);
}

// Input
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'Space') shoot(); });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
window.addEventListener('mousedown', (e) => { if (e.button === 0) shoot(); });

// Movement
function updatePlayer(delta) {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0; forward.normalize();

  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0)).normalize();

  let speed = player.speed;
  if (keys['ShiftLeft']) speed += player.sprint;

  const move = new THREE.Vector3();
  if (keys['KeyW']) move.add(forward);
  if (keys['KeyS']) move.sub(forward);
  if (keys['KeyA']) move.sub(right);
  if (keys['KeyD']) move.add(right);
  if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed * delta);

  // einfache Bodenhaftung
  player.position.add(move);
  controls.getObject().position.copy(player.position);
}

// Bots verfolgen Spieler
function updateBots(delta) {
  const playerPos = controls.getObject().position;
  bots.forEach(bot => {
    if (!bot.userData.alive) return;
    const toPlayer = new THREE.Vector3().subVectors(playerPos, bot.position);
    toPlayer.y = 0;
    const dist = toPlayer.length();
    if (dist > 0.001) {
      toPlayer.normalize();
      const speed = bot.userData.speed;
      bot.position.add(toPlayer.multiplyScalar(speed * delta));
    }
    // Schaden bei Kontakt
    if (dist < 0.7) {
      player.health = Math.max(0, player.health - 10 * delta);
    }
  });
}

// Projektile bewegen + Treffer
function updateBullets(delta) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.position.add(b.userData.velocity.clone().multiplyScalar(delta));
    b.userData.life -= delta;

    // Trefferprüfung
    for (let j = 0; j < bots.length; j++) {
      const bot = bots[j];
      if (!bot.userData.alive) continue;
      if (b.position.distanceTo(bot.position) < 0.5) {
        bot.userData.alive = false;
        scene.remove(bot);
        bots.splice(j, 1);
        player.score += 10;
        break;
      }
    }

    if (b.userData.life <= 0) {
      scene.remove(b);
      bullets.splice(i, 1);
    }
  }
}

// Respawn-Logik: halte konstant Bots im Feld
let botSpawnTimer = 0;
function maintainBots(delta) {
  botSpawnTimer += delta;
  if (bots.length < 8 && botSpawnTimer > 0.6) {
    spawnBot();
    botSpawnTimer = 0;
  }
}

// UI
function updateUI() {
  statsEl.textContent = `HP: ${player.health.toFixed(0)}  |  Score: ${player.score}  |  Bots: ${bots.length}`;
}

// Resize
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// Init: ein paar Bots
for (let i = 0; i < 6; i++) spawnBot();

// Game Loop
let last = performance.now();
function loop(now) {
  const delta = Math.min(0.05, (now - last) / 1000); // clamp
  last = now;

  if (controls.isLocked) {
    updatePlayer(delta);
    updateBots(delta);
    updateBullets(delta);
    maintainBots(delta);
    updateUI();

    // Game Over
    if (player.health <= 0) {
      document.getElementById('ui').style.display = 'block';
      startBtn.textContent = 'Neu starten';
      controls.unlock();
      // Reset
      player.health = 100; player.score = 0;
      bots.forEach(b => scene.remove(b));
      bots.length = 0;
      for (let i = 0; i < 6; i++) spawnBot();
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
