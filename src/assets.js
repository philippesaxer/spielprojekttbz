/**
 * Lädt und gibt die notwendigen Assets (Texturen und Materialien) zurück.
 * @param {THREE} THREE - Das THREE.js-Objekt.
 * @returns {Promise<{botMaterial: THREE.Material}>}
 */
export async function loadAssets(THREE) {
  // 1. Textur laden
  const textureLoader = new THREE.TextureLoader();
  // PASSEN SIE DEN DATEINAMEN HIER AN
  const botTexture = await textureLoader.loadAsync('images/farhan.png'); 

  // 2. MeshStandardMaterial erstellen und Textur als 'map' verwenden
  const botMaterial = new THREE.MeshStandardMaterial({
    map: botTexture,
    // Optional: Eigenschaften, um die Textur besser zur Geltung zu bringen
    roughness: 1, 
    metalness: 0 
  });

  return {
    botMaterial: botMaterial,
  };
}
