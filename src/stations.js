import * as THREE from 'three';

let stations = [];

/**
 * Create pressure plate geometry (cylinder)
 * @returns {THREE.Mesh} Pressure plate mesh
 */
function createPlateMesh(x, z) {
  // Cylinder: 3 units diameter (1.5 radius), 0.2 units height
  const plateGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 16);
  
  // Soft yellow with emissive glow
  const plateMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFF88,
    emissive: 0xFFFF88,
    emissiveIntensity: 0.5,
    flatShading: false // Cylinders look better smooth
  });
  
  const plate = new THREE.Mesh(plateGeometry, plateMaterial);
  
  // Position at ground level
  // X,Z coordinates from maze grid centered at origin
  const mazeWidth = 50;
  const mazeHeight = 50;
  const posX = x - mazeWidth / 2;
  const posZ = z - mazeHeight / 2;
  
  plate.position.set(posX, 0.1, posZ);
  
  return plate;
}

/**
 * Place plates randomly in accessible maze paths
 * @param {number[][]} mazeData - 2D array where 1=wall, 0=path
 * @returns {Array} Array of valid positions for plate placement
 */
function getRandomPlatePlacements(mazeData, numPlates) {
  const mazeWidth = mazeData.length;
  const mazeHeight = mazeData[0].length;
  
  const placements = [];
  let attempts = 0;
  const maxAttempts = 2000;
  
  // Minimum distance from spawn point (0,0)
  const minDistanceFromSpawn = 3;
  
  while (placements.length < numPlates && attempts < maxAttempts) {
    const x = Math.floor(Math.random() * mazeWidth);
    const z = Math.floor(Math.random() * mazeHeight);
    
    attempts++;
    
    // Check if position is accessible path (not wall)
    if (mazeData[x][z] !== 0) {
      continue; // Wall, skip
    }
    
    // Check if not too close to spawn point
    const distFromSpawn = Math.sqrt(x * x + z * z);
    if (distFromSpawn < minDistanceFromSpawn) {
      continue; // Too close to spawn
    }
    
    // Check if not too close to other plates (minimum 2 cells apart)
    let tooClose = false;
    for (const existing of placements) {
      const dist = Math.sqrt((x - existing.x) ** 2 + (z - existing.z) ** 2);
      if (dist < 2) {
        tooClose = true;
        break;
      }
    }
    
    if (tooClose) {
      continue; // Too close to existing plate
    }
    
    // Valid placement found
    placements.push({ x, z });
  }
  
  return placements;
}

/**
 * Create stations (pressure plates) and add to scene
 * @param {THREE.Scene} scene - Three.js scene
 * @param {number[][]} mazeData - 2D array where 1=wall, 0=path
 * @returns {Array} Array of station objects with position and mesh
 */
export function createStations(scene, mazeData) {
  const numPlates = 12;
  const placements = getRandomPlatePlacements(mazeData, numPlates);
  
  stations = [];
  
  for (const placement of placements) {
    const plate = createPlateMesh(placement.x, placement.z);
    scene.add(plate);
    
    stations.push({
      x: placement.x,
      z: placement.z,
      mesh: plate,
      position: plate.position.clone()
    });
  }
  
  console.log(`[Stations] Created ${stations.length} pressure plates`);
  
  return stations;
}

/**
 * Get all stations (for debugging)
 * @returns {Array} Array of station objects
 */
export function getStations() {
  return stations;
}
