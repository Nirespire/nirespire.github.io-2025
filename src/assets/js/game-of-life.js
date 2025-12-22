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

// Calculate plane size to fit viewport
const cameraZ = 10;
const vFOV = (camera.fov * Math.PI) / 180;
const height = 2 * Math.tan(vFOV / 2) * cameraZ;
const width = height * camera.aspect;

camera.position.z = cameraZ;

// Conway's Game of Life configuration
const cellSize = 0.3; // Size of each cell in world space
const gridWidth = Math.ceil(width / cellSize);
const gridHeight = Math.ceil(height / cellSize);
const updateRate = 10; // Update grid every N frames
let frameCount = 0;

// Game of Life grid
let grid = createRandomGrid(gridWidth, gridHeight, 0.3); // 30% initial alive cells
let nextGrid = createEmptyGrid(gridWidth, gridHeight);

// Get theme colors
function getThemeColors() {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDarkMode) {
    return { alive: 0xf97316, dead: 0x2d2d2d };
  } else {
    return { alive: 0xf97316, dead: 0xffffff };
  }
}

function createRandomGrid(w, h, fillRatio) {
  const grid = [];
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      grid[y][x] = Math.random() < fillRatio ? 1 : 0;
    }
  }
  return grid;
}

function createEmptyGrid(w, h) {
  const grid = [];
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      grid[y][x] = 0;
    }
  }
  return grid;
}

function countAliveNeighbors(x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + gridWidth) % gridWidth;
      const ny = (y + dy + gridHeight) % gridHeight;
      count += grid[ny][nx];
    }
  }
  return count;
}

function updateGameOfLife() {
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const aliveNeighbors = countAliveNeighbors(x, y);
      const currentCell = grid[y][x];

      // Conway's rules
      if (currentCell === 1) {
        // Live cell with 2-3 neighbors survives
        nextGrid[y][x] = aliveNeighbors === 2 || aliveNeighbors === 3 ? 1 : 0;
      } else {
        // Dead cell with exactly 3 neighbors becomes alive
        nextGrid[y][x] = aliveNeighbors === 3 ? 1 : 0;
      }
    }
  }

  // Swap grids
  [grid, nextGrid] = [nextGrid, grid];
}

// Create points geometry
const geometry = new THREE.BufferGeometry();
const positionsArray = [];
const colorsArray = [];
const themeColors = getThemeColors();
const aliveColor = new THREE.Color(themeColors.alive);
const deadColor = new THREE.Color(themeColors.dead);

// Build initial geometry
function updateGeometry() {
  positionsArray.length = 0;
  colorsArray.length = 0;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const worldX = -width / 2 + x * cellSize + cellSize / 2;
      const worldY = height / 2 - y * cellSize - cellSize / 2;

      positionsArray.push(worldX, worldY, 0);

      // Color based on alive/dead state
      const color = grid[y][x] === 1 ? aliveColor : deadColor;
      colorsArray.push(color.r, color.g, color.b);
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positionsArray), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colorsArray), 3));
}

updateGeometry();

const material = new THREE.PointsMaterial({
  size: cellSize * 0.8,
  transparent: true,
  opacity: 0.7,
  vertexColors: true,
  sizeAttenuation: true
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// Handle mouse movement - interact with Game of Life
let mouseWorldX = 0;
let mouseWorldY = 0;

document.addEventListener('mousemove', (event) => {
  const mouseNormX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseNormY = -(event.clientY / window.innerHeight) * 2 + 1;

  // Convert to world coordinates
  mouseWorldX = mouseNormX * (width / 2);
  mouseWorldY = mouseNormY * (height / 2);

  // Create gliders or patterns at mouse position
  const cellX = Math.floor((mouseWorldX + width / 2) / cellSize);
  const cellY = Math.floor((height / 2 - mouseWorldY) / cellSize);

  if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {
    // Add a small pattern around mouse
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = (cellX + dx + gridWidth) % gridWidth;
        const y = (cellY + dy + gridHeight) % gridHeight;
        grid[y][x] = 1;
      }
    }
  }
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

  frameCount++;

  // Update Game of Life every updateRate frames
  if (frameCount % updateRate === 0) {
    updateGameOfLife();
    updateGeometry();
    geometry.attributes.color.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

animate();