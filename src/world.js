// philippesaxer/spielprojekttbz/spielprojekttbz-f0773918b423bf6de93fc19d345bb0610d987b2e/src/world.js

import { TEXTURES } from './assets.js'; // NEU: Importiere die Texturen

export function createWorld(scene) {
  // Verbesserte Hintergrundfarbe und Beleuchtung
  scene.background = new THREE.Color(0x334455); // Dunkleres, interessanteres Blau/Grau

  const ambient = new THREE.AmbientLight(0xffffff, 0.6); // Etwas helleres Umgebungslicht
  const dir = new THREE.DirectionalLight(0xffffff, 1.2); // Stärkeres gerichtetes Licht
  dir.position.set(10, 25, 15);
  
  // NEU: Schatteneinstellungen für die DirectionalLight
  dir.castShadow = true; // Lichtquelle wirft Schatten
  dir.shadow.mapSize.width = 2048;
  dir.shadow.mapSize.height = 2048;
  dir.shadow.camera.near = 0.5;
  dir.shadow.camera.far = 100;
  dir.shadow.camera.left = -50;
  dir.shadow.camera.right = 50;
  dir.shadow.camera.top = 50;
  dir.shadow.camera.bottom = -50;

  scene.add(ambient, dir);

  // Floor mit Textur und besserem Material
  const floorGeo = new THREE.PlaneGeometry(200, 200);
  const floorMat = new THREE.MeshStandardMaterial({
    map: TEXTURES.floorColor,
    normalMap: TEXTURES.floorNormal, // Fügt Oberflächendetails hinzu
    roughness: 0.8, // Definiert, wie rau die Oberfläche ist
    metalness: 0.1,
    color: 0xffffff // Lässt die Texturfarbe voll durchkommen
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'floor';
  scene.add(floor);

  // Obstacles mit Textur und besserem Material
  const obstacleMat = new THREE.MeshStandardMaterial({
    map: TEXTURES.obstacleColor,
    normalMap: TEXTURES.obstacleNormal,
    roughness: 0.7,
    metalness: 0.2,
    color: 0xffffff
  });

  const boxes = [];
  for (let i = 0; i < 14; i++) {
    const geo = new THREE.BoxGeometry(4 + Math.random() * 4, 2 + Math.random() * 4, 4 + Math.random() * 4);
    
    // Erstelle für jedes Hindernis ein Material-Duplikat, um die Texturwiederholung anzupassen
    const mat = obstacleMat.clone(); 
    // NEU: Texturwiederholung an die Größe der Box anpassen (damit die Textur nicht überdehnt wird)
    const repeatX = geo.parameters.width / 4;
    const repeatY = geo.parameters.height / 4;
    mat.map.repeat.set(repeatX, repeatY);
    if(mat.normalMap) mat.normalMap.repeat.set(repeatX, repeatY);
    
    const box = new THREE.Mesh(geo, mat);
    box.position.set((Math.random() - 0.5) * 120, geo.parameters.height / 2, (Math.random() - 0.5) * 120);
    box.castShadow = true; // Das Objekt wirft Schatten
    box.receiveShadow = true; // Das Objekt kann Schatten empfangen
    box.name = 'obstacle';
    scene.add(box);
    boxes.push(box);
  }

  return { floor, obstacles: boxes };
}
