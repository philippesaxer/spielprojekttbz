export async function loadAssets(THREE) {
  
  const textureLoader = new THREE.TextureLoader();
  
  const botTexture = await textureLoader.loadAsync('images/farhan.png'); 


  const botMaterial = new THREE.MeshStandardMaterial({
    map: botTexture,
  
    roughness: 1, 
    metalness: 0 
  });

  return {
    botMaterial: botMaterial,
  };
}
