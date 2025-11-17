import { raycastDown } from './utils.js';

export class Player {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;

    this.health = 100;
    this.dead = false;

    this.position = new THREE.Vector3(0, 2, 5);
    this.velocity = new THREE.Vector3();
    this.onGround = false;

    this.speed = 10;
    this.jumpStrength = 8;
    this.gravity = 20;

    this.pitch = 0; this.yaw = 0;

    // Dummy player body for collisions
    const bodyGeo = new THREE.CapsuleGeometry(0.35, 1.2, 8, 16);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x8fd3ff, wireframe: true });
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.visible = false; // invisible in FP view
    scene.add(this.body);

    this.camera.position.copy(this.position);
  }

  getShootOrigin() {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    return this.camera.position.clone().add(forward.clone().multiplyScalar(0.6));
  }

  getShootDirection() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    // small random spread
    dir.x += (Math.random() - 0.5) * 0.01;
    dir.y += (Math.random() - 0.5) * 0.01;
    dir.z += (Math.random() - 0.5) * 0.01;
    return dir.normalize();
  }

  damage(d) {
    this.health = Math.max(0, this.health - d);
    if (this.health <= 0) this.dead = true;
  }

  reset() {
    this.health = 100;
    this.dead = false;
    this.position.set(0, 2, 5);
    this.velocity.set(0, 0, 0);
    this.pitch = 0; this.yaw = 0;
    this.camera.position.copy(this.position);
  }

  update(dt, world) {
    // Camera orientation comes from mouse input (set externally)
    this.camera.rotation.set(this.pitch, this.yaw, 0);

    // Gravity
    this.velocity.y -= this.gravity * dt;

    // Movement (set externally via Input)
    this.position.addScaledVector(this.velocity, dt);

    // Ground collision
    const groundY = raycastDown(this.position, world);
    if (groundY !== null && this.position.y <= groundY + 1.8) {
      this.onGround = true;
      this.position.y = groundY + 1.8;
      this.velocity.y = 0;
    } else {
      this.onGround = false;
    }

    // Simple obstacle collision: clamp inside bounding boxes
    for (const o of world.obstacles) {
      const b = new THREE.Box3().setFromObject(o);
      const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(this.position.x, this.position.y - 0.9, this.position.z),
        new THREE.Vector3(0.7, 1.8, 0.7)
      );
      if (b.intersectsBox(playerBox)) {
        // push out along smallest axis
        const size = new THREE.Vector3();
        b.getSize(size);
        const center = new THREE.Vector3();
        b.getCenter(center);
        const delta = playerBox.getCenter(new THREE.Vector3()).sub(center);
        const ax = Math.sign(delta.x) * (size.x / 2 + 0.35) - delta.x;
        const az = Math.sign(delta.z) * (size.z / 2 + 0.35) - delta.z;
        if (Math.abs(ax) < Math.abs(az)) this.position.x += ax; else this.position.z += az;
      }
    }

    this.camera.position.copy(this.position);
    this.body.position.copy(this.position);
  }
}
