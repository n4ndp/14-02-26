import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);

const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaffaa });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 1, -10);
scene.add(cube);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

camera.position.set(0, 15, 30);
camera.lookAt(0, 0, 0);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  cube.rotation.y += 0.5 * delta;
  
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.__DEBUG_SCENE = scene;
window.__DEBUG_RENDERER = renderer;
window.__DEBUG_CAMERA = camera;

animate();
