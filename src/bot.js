export class Bot {

  constructor(scene, pos = new THREE.Vector3(), customMaterial) { 
    this.kind = 'bot';
    this.health = 100;
    this.dead = false;
    this.speed = 4;
    this.aggroRange = 16;
    this.attackRange = 2.2;
    this.cooldown = 0;

    
    const geo = new THREE.CapsuleGeometry(0.4, 1.0, 8, 16);
    const mat = customMaterial || new THREE.MeshStandardMaterial({ color: 0xff5f5f }); 
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(pos);
    scene.add(this.mesh);

    this._wanderDir = new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5).normalize();
  }

  damage(d) {
    if (this.dead) return;
    this.health -= d;
    this.mesh.material.color.setHex(0xffb3b3); 
    if (this.health <= 0) {
      this.dead = true;
      this.mesh.visible = false;
    }
  }

  update(dt, player, world) {
    if (this.dead) return;

    
    this.mesh.material.color.lerp(new THREE.Color(0xffffff), 0.1); 

    const toPlayer = player.position.clone().sub(this.mesh.position);
    const dist = toPlayer.length();

    if (dist < this.aggroRange) {
      // pursue
      toPlayer.y = 0;
      toPlayer.normalize();
      this.mesh.position.addScaledVector(toPlayer, this.speed * dt);
      
      this.mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z) + Math.PI; 

    } else {
      
      this.mesh.position.addScaledVector(this._wanderDir, this.speed * 0.5 * dt);
      if (Math.random() < 0.01) {
        this._wanderDir.set(Math.random()-0.5, 0, Math.random()-0.5).normalize();
      }
      
      
      this.mesh.rotation.y = Math.atan2(this._wanderDir.x, this._wanderDir.z) + Math.PI;
    }

   
    this.mesh.position.y = 1.5;

     //obstacle
    for (const o of world.obstacles) {
      const b = new THREE.Box3().setFromObject(o);
      const botBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(this.mesh.position.x, this.mesh.position.y - 0.7, this.mesh.position.z),
        new THREE.Vector3(0.8, 1.6, 0.8)
      );
      if (b.intersectsBox(botBox)) {
        const center = new THREE.Vector3();
        b.getCenter(center);
        const away = botBox.getCenter(new THREE.Vector3()).sub(center).setY(0).normalize();
        this.mesh.position.addScaledVector(away, 2 * dt);
      }
    }

    // attack 
    this.cooldown -= dt;
    if (dist < this.attackRange && this.cooldown <= 0) {
      player.damage(10);
      this.cooldown = 1.2;
    }
  }
}

export class BotManager {
  constructor(scene, assets) { 
    this.scene = scene;
    this.bots = [];
    this.assets = assets; 
  }

  spawn(pos) {
    const b = new Bot(this.scene, pos, this.assets.botMaterial); 
    this.bots.push(b);
  }

  update(dt, player, world) {
    for (const b of this.bots) b.update(dt, player, world);
  }

  reset() {
    for (const b of this.bots) {
      b.mesh.removeFromParent();
    }
    this.bots.length = 0;
  }

  count() { return this.bots.length; }
  aliveCount() { return this.bots.filter(b => !b.dead).length; }
}
