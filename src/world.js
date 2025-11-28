export function createWorld(scene) {
  scene.background = new THREE.Color(0x10161b);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(10, 20, 10);

  scene.add(ambient, dir);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(200, 200);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2f35, roughness: 1, metalness: 0 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'floor';
  scene.add(floor);

  // Obstacles
  const boxes = [];
  for (let i = 0; i < 14; i++) {
    const geo = new THREE.BoxGeometry(4 + Math.random() * 4, 2 + Math.random() * 4, 4 + Math.random() * 4);
    const mat = new THREE.MeshStandardMaterial({ color: 0x3a4753 });
    const box = new THREE.Mesh(geo, mat);
    box.position.set((Math.random() - 0.5) * 120, geo.parameters.height / 2, (Math.random() - 0.5) * 120);
    box.castShadow = true;
    box.receiveShadow = true;
    box.name = 'obstacle';
    scene.add(box);
    boxes.push(box);
  }

  return { floor, obstacles: boxes };
}
