// philippesaxer/spielprojekttbz/spielprojekttbz-f0773918b423bf6de93fc19d345bb0610d987b2e/src/assets.js

// **HINWEIS:** Dieser Code geht davon aus, dass THREE global verfügbar ist (wie in index.html festgelegt).

const textureLoader = new THREE.TextureLoader();

// Lade Texturen. Du musst die Bilddateien im Ordner './textures/' ablegen.
export const TEXTURES = {
    // Boden (Floor)
    floorColor: textureLoader.load('./textures/rock_floor_color.jpg'),
    floorNormal: textureLoader.load('./textures/rock_floor_normal.jpg'), // Für 3D-Effekt (optional)
    
    // Hindernisse (Obstacles)
    obstacleColor: textureLoader.load('./textures/wall_brick_color.jpg'),
    obstacleNormal: textureLoader.load('./textures/wall_brick_normal.jpg'), // Für 3D-Effekt (optional)
};

// Setze Wiederholung (RepeatWrapping) für das Kacheln der Texturen auf dem Boden (200x200 Map)
TEXTURES.floorColor.wrapS = THREE.RepeatWrapping;
TEXTURES.floorColor.wrapT = THREE.RepeatWrapping;
TEXTURES.floorColor.repeat.set(40, 40); // Wiederhole die Textur 40x
TEXTURES.floorNormal.wrapS = THREE.RepeatWrapping;
TEXTURES.floorNormal.wrapT = THREE.RepeatWrapping;
TEXTURES.floorNormal.repeat.set(40, 40);

// Für Farbkorrektur
for (const key in TEXTURES) {
    if (key.includes('Color')) {
        // Setzt den Farbraum für Farbtexturen (sRGB)
        TEXTURES[key].colorSpace = THREE.SRGBColorSpace; 
    }
}
