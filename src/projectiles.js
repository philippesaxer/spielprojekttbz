export class Projectile {
  constructor(scene) {
    this.speed = 40;
    this.alive = false;
    this.life = 0;
    this.onHit = null;

    const geo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 12);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x222222 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.z = Math.PI / 2;
    this.mesh.visible = false;
    scene.add(this.mesh);

    this.dir = new THREE.Vector3();
  }

  spawn(origin, dir, life = 1.5) {
    this.mesh.position.copy(origin);
    this.dir.copy(dir);
    this.life = life;
    this.alive = true;
    this.mesh.visible = true;

    this.mesh.lookAt(origin.clone().add(dir));
    this.mesh.rotateX(Math.PI / 2);
  }

  update(dt, world, bots) {
    if (!this.alive) return;
    this.life -= dt;
    if (this.life <= 0) return this.despawn();

    this.mesh.position.addScaledVector(this.dir, this.speed * dt);

    for (const b of bots.bots) {
      if (b.dead) continue;
      const botBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z),
        new THREE.Vector3(0.8, 1.6, 0.8)
      );
      const p = this.mesh.position;
      if (botBox.containsPoint(p)) {
        if (this.onHit) this.onHit(b);
        this.despawn();
        break;
      }
    }

    if (Math.abs(this.mesh.position.x) > 120 || Math.abs(this.mesh.position.z) > 120) {
      this.despawn();
    }
  }

  despawn() {
    this.alive = false;
    this.mesh.visible = false;
  }
}

export class ProjectilePool {
  constructor(scene) {
    this.scene = scene;
    this.pool = Array.from({ length: 64 }, () => new Projectile(scene));
    this.cooldown = 0;
  }

  spawn(origin, dir, life) {
    if (this.cooldown > 0) return null;
    this.cooldown = 0.15;
    const p = this.pool.find(x => !x.alive);
    if (!p) return null;
    p.spawn(origin, dir, life);
    return p;
  }

  update(dt, world, bots) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    for (const p of this.pool) p.update(dt, world, bots);
  }

  reset() {
    for (const p of this.pool) p.despawn();
    this.cooldown = 0;
  }
}
