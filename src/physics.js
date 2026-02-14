import RAPIER from '@dimforge/rapier3d';

let world = null;

/**
 * Initialize Rapier physics world with gravity
 * Must be called before creating any physics bodies
 */
export async function initPhysics() {
  await RAPIER.init();
  const gravity = { x: 0.0, y: -9.81, z: 0.0 };
  world = new RAPIER.World(gravity);
  console.log('[Physics] Rapier world initialized');
  return world;
}

/**
 * Create rigid body and collider for the car
 * @param {RAPIER.World} world - Physics world
 * @param {THREE.Vector3} position - Initial position
 * @returns {RAPIER.RigidBody} Car rigid body
 */
export function createCarBody(world, position) {
  // Create dynamic rigid body at car position
  const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(position.x, position.y, position.z)
    .setLinearDamping(0.5)  // Prevents endless sliding
    .setAngularDamping(1.0); // Prevents endless spinning

  const rigidBody = world.createRigidBody(rigidBodyDesc);

  // Add box collider matching car dimensions (~2x1x3 units)
  // Car model is roughly 2 units wide, 1 unit tall, 3 units long
  const colliderDesc = RAPIER.ColliderDesc.cuboid(1.0, 0.5, 1.5)
    .setMass(100.0)       // ~100kg mass
    .setFriction(0.8)     // Prevents ice-skating
    .setRestitution(0.1); // Small bounce

  world.createCollider(colliderDesc, rigidBody);

  console.log('[Physics] Car body created at', position);
  return rigidBody;
}

/**
 * Apply forces to car body based on keyboard input
 * @param {RAPIER.RigidBody} carBody - Car rigid body
 * @param {Object} inputKeys - Keyboard state from window.__DEBUG_INPUT
 */
export function updateCarPhysics(carBody, inputKeys) {
  if (!carBody || !inputKeys) return;

  // Get car's current rotation to calculate forward direction
  const rotation = carBody.rotation();
  const quat = new RAPIER.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
  
  // Calculate forward vector from quaternion (0,0,-1 rotated by car orientation)
  // Forward in car space is -Z direction
  const forward = {
    x: 2 * (quat.x * quat.z - quat.w * quat.y),
    y: 2 * (quat.y * quat.z + quat.w * quat.x),
    z: 1 - 2 * (quat.x * quat.x + quat.y * quat.y)
  };

  // Normalize forward vector
  const len = Math.sqrt(forward.x * forward.x + forward.y * forward.y + forward.z * forward.z);
  forward.x /= len;
  forward.y /= len;
  forward.z /= len;

  // Tuned force values for arcade-fun feel
  const FORWARD_FORCE = 80.0;
  const TURN_TORQUE = 8.0;

  // Forward/Backward movement
  if (inputKeys.forward) {
    carBody.applyImpulse({ x: forward.x * FORWARD_FORCE, y: 0, z: forward.z * FORWARD_FORCE }, true);
  }
  if (inputKeys.backward) {
    carBody.applyImpulse({ x: -forward.x * FORWARD_FORCE, y: 0, z: -forward.z * FORWARD_FORCE }, true);
  }

  // Left/Right rotation (torque around Y-axis)
  if (inputKeys.left) {
    carBody.applyTorqueImpulse({ x: 0, y: TURN_TORQUE, z: 0 }, true);
  }
  if (inputKeys.right) {
    carBody.applyTorqueImpulse({ x: 0, y: -TURN_TORQUE, z: 0 }, true);
  }
}

/**
 * Sync Three.js car mesh with Rapier rigid body position/rotation
 * @param {THREE.Object3D} car - Three.js car mesh
 * @param {RAPIER.RigidBody} carBody - Car rigid body
 */
export function syncCarMesh(car, carBody) {
  if (!car || !carBody) return;

  const position = carBody.translation();
  const rotation = carBody.rotation();

  car.position.set(position.x, position.y, position.z);
  car.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
}

/**
 * Create static colliders for maze walls
 * @param {RAPIER.World} world - Physics world
 * @param {number[][]} mazeData - 2D array where 1=wall, 0=path
 */
export function createMazeColliders(world, mazeData) {
  const width = mazeData.length;
  const height = mazeData[0].length;
  
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < height; z++) {
      if (mazeData[x][z] === 1) {
        // Create static rigid body for wall
        const posX = x - width / 2;
        const posZ = z - height / 2;
        
        const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
          .setTranslation(posX, 2, posZ);
        
        const rigidBody = world.createRigidBody(rigidBodyDesc);
        
        // Add box collider matching wall size (1x4x1)
        const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 2.0, 0.5) // Half-extents
          .setFriction(0.8);
        
        world.createCollider(colliderDesc, rigidBody);
      }
    }
  }
  
  console.log('[Physics] Maze wall colliders created');
}

/**
 * Step physics simulation forward
 * @param {RAPIER.World} world - Physics world
 */
export function stepPhysics(world) {
  if (!world) return;
  world.step();
}
