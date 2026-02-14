import * as THREE from 'three';

let mazeData = null;

/**
 * Generate maze using Recursive Backtracker algorithm
 * @param {number} width - Width of maze grid
 * @param {number} height - Height of maze grid
 * @returns {number[][]} 2D array where 1=wall, 0=path
 */
export function generateMaze(width, height) {
  // Initialize grid with all walls (1)
  const maze = Array(width).fill(null).map(() => Array(height).fill(1));
  
  // Helper to get unvisited neighbors
  const getUnvisitedNeighbors = (x, z, visited) => {
    const neighbors = [];
    const directions = [
      { dx: 0, dz: -2, wallX: 0, wallZ: -1 }, // North
      { dx: 2, dz: 0, wallX: 1, wallZ: 0 },   // East
      { dx: 0, dz: 2, wallX: 0, wallZ: 1 },   // South
      { dx: -2, dz: 0, wallX: -1, wallZ: 0 }  // West
    ];
    
    for (const dir of directions) {
      const nx = x + dir.dx;
      const nz = z + dir.dz;
      if (nx >= 0 && nx < width && nz >= 0 && nz < height && !visited[nx][nz]) {
        neighbors.push({ x: nx, z: nz, wallX: x + dir.wallX, wallZ: z + dir.wallZ });
      }
    }
    
    return neighbors;
  };
  
  // Track visited cells
  const visited = Array(width).fill(null).map(() => Array(height).fill(false));
  
  // Start at (0, 0) to ensure spawn point is in open area
  const stack = [{ x: 0, z: 0 }];
  visited[0][0] = true;
  maze[0][0] = 0; // Mark starting cell as path
  
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current.x, current.z, visited);
    
    if (neighbors.length > 0) {
      // Pick random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Remove wall between current and next
      maze[next.wallX][next.wallZ] = 0;
      maze[next.x][next.z] = 0;
      
      // Mark as visited and add to stack
      visited[next.x][next.z] = true;
      stack.push({ x: next.x, z: next.z });
    } else {
      // Backtrack
      stack.pop();
    }
  }
  
  // Store for later access
  mazeData = maze;
  
  return maze;
}

/**
 * Create Three.js InstancedMesh for maze walls
 * @param {number[][]} maze - 2D array where 1=wall, 0=path
 * @returns {THREE.InstancedMesh} Instanced mesh of all walls
 */
export function createMazeGeometry(maze) {
  const width = maze.length;
  const height = maze[0].length;
  
  // Count walls
  let wallCount = 0;
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < height; z++) {
      if (maze[x][z] === 1) {
        wallCount++;
      }
    }
  }
  
  // Create wall geometry (1 unit wide x 4 units tall x 1 unit deep)
  const wallGeometry = new THREE.BoxGeometry(1, 4, 1);
  
  // Pastel pink color for aesthetic appeal
  const wallMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xFFB6C1,
    flatShading: true // Low-poly aesthetic
  });
  
  // Create instanced mesh
  const instancedMesh = new THREE.InstancedMesh(wallGeometry, wallMaterial, wallCount);
  
  // Position each wall instance
  const matrix = new THREE.Matrix4();
  let instanceIndex = 0;
  
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < height; z++) {
      if (maze[x][z] === 1) {
        // Position wall at grid coordinates
        // Center maze at origin: offset by width/2 and height/2
        const posX = x - width / 2;
        const posZ = z - height / 2;
        
        matrix.setPosition(posX, 2, posZ); // y=2 centers 4-unit tall wall
        instancedMesh.setMatrixAt(instanceIndex, matrix);
        instanceIndex++;
      }
    }
  }
  
  // Update instance matrices
  instancedMesh.instanceMatrix.needsUpdate = true;
  
  return instancedMesh;
}

/**
 * Get maze data for collision detection
 * @returns {number[][]} 2D array where 1=wall, 0=path
 */
export function getMazeData() {
  return mazeData;
}
