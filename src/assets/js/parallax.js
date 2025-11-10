import * as THREE from '/assets/js/three/three.module.js';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add to page
document.body.appendChild(renderer.domElement);

// Style the canvas
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '-1';
renderer.domElement.style.pointerEvents = 'none';

// Create geometry
const geometry = new THREE.PlaneGeometry(15, 15, 15, 15);
const material = new THREE.MeshBasicMaterial({
  color: 0x6366f1, // Using the accent color
  wireframe: true,
  transparent: true,
  opacity: 0.1
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 10;

// Handle mouse movement
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Subtle rotation based on mouse position
  plane.rotation.x = mouseY * 0.1;
  plane.rotation.y = mouseX * 0.1;
  
  renderer.render(scene, camera);
}

animate();