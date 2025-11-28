import { createWorld } from './world.js';
import { Player } from './player.js';
import { BotManager } from './bot.js';
import { ProjectilePool } from './projectiles.js';
import { Input } from './input.js';
import { clamp } from './utils.js';

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ui = ui;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  
    
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.world = createWorld(this.scene);
    this.player = new Player(this.camera, this.scene);
    this.bots = new BotManager(this.scene);
    this.projectiles = new ProjectilePool(this.scene);

    this.input = new Input(this.canvas, this.player);
    this.state = 'menu'; // menu | playing | paused | over
    this.score = 0;

    this._bind();
    this._spawnWave(8);
    this._render(0);
  }

  _bind() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement === this.canvas;
      this.input.pointerLocked = locked;
      if (!locked && this.state === 'playing') this.pause();
    });

    this.input.onShoot(() => {
      if (this.state !== 'playing') return;
      const p = this.projectiles.spawn(this.player.getShootOrigin(), this.player.getShootDirection(), 60);
      p.onHit = (target) => {
        if (target.kind === 'bot') {
          target.damage(50);
          if (target.dead) {
            this.score += 100;
            this.ui.setScore(this.score);
          }
        }
      };
    });

    this.input.onPause(() => {
      if (this.state === 'playing') this.pause();
      else if (this.state === 'paused') this.resume();
    });
  }

  start() {
    this.state = 'playing';
    this.ui.showHUD(true);
    this.ui.showStart(false);
    this.canvas.requestPointerLock();
  }

  pause() {
    this.state = 'paused';
    this.ui.showPause(true);
    document.exitPointerLock();
  }

  resume() {
    this.state = 'playing';
    this.ui.showPause(false);
    this.canvas.requestPointerLock();
  }

  reset() {
    this.score = 0;
    this.ui.setScore(0);
    this.player.reset();
    this.bots.reset();
    this.projectiles.reset();
    this._spawnWave(8);
    this.state = 'playing';
    this.ui.showGameOver(false);
    this.ui.showHUD(true);
    this.canvas.requestPointerLock();
  }

  _spawnWave(n) {
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      this.bots.spawn(new THREE.Vector3(x, 1, z));
    }
    this.ui.setBots(this.bots.count());
  }

  _render() {
    requestAnimationFrame(() => this._render());
    const dt = clamp(this.clock.getDelta(), 0, 0.05);

    if (this.state === 'playing') {
      this.input.update(dt, this.player);
      this.player.update(dt, this.world);
      this.bots.update(dt, this.player, this.world);
      this.projectiles.update(dt, this.world, this.bots);
      this.ui.setHealth(this.player.health);
      this.ui.setBots(this.bots.aliveCount());

      if (this.player.dead) {
        this.state = 'over';
        this.ui.showHUD(false);
        this.ui.showGameOver(true, this.score);
        document.exitPointerLock();
      }

      if (this.bots.aliveCount() === 0) {
        this._spawnWave(8);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
