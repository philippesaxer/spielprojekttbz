export class Input {
  constructor(canvas, player) {
    this.canvas = canvas;
    this.player = player;
    this.pointerLocked = false;

    this.move = { forward: 0, right: 0 };
    this.sprint = false;
    this.jumpRequested = false;

    this._shootHandlers = [];
    this._pauseHandlers = [];

    canvas.addEventListener('click', () => {
      if (!this.pointerLocked) canvas.requestPointerLock();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      const sensitivity = 0.0025;
      this.player.yaw -= e.movementX * sensitivity;
      this.player.pitch -= e.movementY * sensitivity;
      this.player.pitch = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, this.player.pitch));
    });

    window.addEventListener('keydown', (e) => this._onKey(e, true));
    window.addEventListener('keyup',   (e) => this._onKey(e, false));
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this._shootHandlers.forEach(h => h());
    });
  }

  _onKey(e, down) {
    switch (e.code) {
      case 'KeyW': this.move.forward = down ? 1 : (this.move.forward === 1 ? 0 : this.move.forward); break;
      case 'KeyS': this.move.forward = down ? -1 : (this.move.forward === -1 ? 0 : this.move.forward); break;
      case 'KeyA': this.move.right = down ? -1 : (this.move.right === -1 ? 0 : this.move.right); break;
      case 'KeyD': this.move.right = down ? 1 : (this.move.right === 1 ? 0 : this.move.right); break;
      case 'ShiftLeft': this.sprint = down; break;
      case 'Space': this.jumpRequested = down; break;
      case 'Escape': this._pauseHandlers.forEach(h => h()); break;
    }
  }

  onShoot(fn) { this._shootHandlers.push(fn); }
  onPause(fn) { this._pauseHandlers.push(fn); }

  update(dt, player) {
    // convert move to world space
    const forward = new THREE.Vector3();
    player.camera.getWorldDirection(forward);
    forward.y = 0; forward.normalize();

    
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), forward).normalize();

    const speed = player.speed * (this.sprint ? 1.6 : 1);
    player.velocity.x = 0;
    player.velocity.z = 0;
    player.velocity.addScaledVector(forward, speed * this.move.forward);
    player.velocity.addScaledVector(right, speed * this.move.right * -1);

    if (this.jumpRequested && player.onGround) {
      player.velocity.y = player.jumpStrength;
      this.jumpRequested = false;
    }
  }
}
