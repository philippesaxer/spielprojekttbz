export async function loadAssets(THREE) {
  
  const textureLoader = new THREE.TextureLoader();
  
  const botTexture = await textureLoader.loadAsync('images/frau.png'); 


  const botMaterial = new THREE.MeshStandardMaterial({
    map: botTexture,
  
    roughness: 1, 
    metalness: 0 
  });

  return {
    botMaterial: botMaterial,
  };
}
