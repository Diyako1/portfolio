// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
let isDarkMode = true;

function getDotColor() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  return styles.getPropertyValue('--dot-color').trim() || 'rgba(255, 255, 255, 0.5)';
}

themeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.documentElement.classList.toggle('light-mode', !isDarkMode);
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// Check for saved theme preference
if (localStorage.getItem('theme') === 'light') {
  isDarkMode = false;
  document.documentElement.classList.add('light-mode');
}

// Interactive Dot Grid with Mouse Distortion Effect
const canvas = document.getElementById('dot-canvas');
const ctx = canvas.getContext('2d');

// Dot grid settings - same size as before
let DOT_SPACING = window.innerWidth <= 600 ? 24 : 16;
const DOT_RADIUS = 1;
const MOUSE_RADIUS = 120; // How far the mouse affects dots
const PUSH_STRENGTH = 15; // How much dots get pushed away
const RETURN_SPEED = 0.08; // How fast dots return to original position

let dots = [];
let mouseX = -1000;
let mouseY = -1000;
let animationId = null;

// Initialize canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  DOT_SPACING = window.innerWidth <= 600 ? 24 : 16;
  initDots();
}

// Create dot grid
function initDots() {
  dots = [];
  const cols = Math.ceil(canvas.width / DOT_SPACING) + 1;
  const rows = Math.ceil(canvas.height / DOT_SPACING) + 1;
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      dots.push({
        originalX: i * DOT_SPACING,
        originalY: j * DOT_SPACING,
        x: i * DOT_SPACING,
        y: j * DOT_SPACING
      });
    }
  }
}

// Draw all dots
function drawDots() {
  // Fill background
  const bgColor = isDarkMode ? '#000000' : '#f5f5f5';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw dots - same color always
  ctx.fillStyle = getDotColor();
  for (const dot of dots) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Update dot positions
function updateDots() {
  for (const dot of dots) {
    // Calculate distance from mouse to dot's original position
    const dx = dot.originalX - mouseX;
    const dy = dot.originalY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Target position (where dot should be)
    let targetX = dot.originalX;
    let targetY = dot.originalY;
    
    // If mouse is close, push the dot away
    if (distance < MOUSE_RADIUS && distance > 0) {
      const force = (1 - distance / MOUSE_RADIUS) * PUSH_STRENGTH;
      targetX = dot.originalX + (dx / distance) * force;
      targetY = dot.originalY + (dy / distance) * force;
    }
    
    // Smoothly move dot towards target position
    dot.x += (targetX - dot.x) * RETURN_SPEED;
    dot.y += (targetY - dot.y) * RETURN_SPEED;
  }
}

// Mouse move handler
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Mouse leave handler
document.addEventListener('mouseleave', () => {
  mouseX = -1000;
  mouseY = -1000;
});

// Animation loop
function animate() {
  updateDots();
  drawDots();
  animationId = requestAnimationFrame(animate);
}

// Krish link easter egg
const krishLink = document.getElementById('krish-link');
let isAnimating = false;
let currentText = 'krish';
const originalText = 'krish';
const targetText = 'goat';

function typewriterEffect(element, fromText, toText, callback) {
  if (isAnimating) return;
  isAnimating = true;
  
  let i = fromText.length;
  
  // Delete characters
  const deleteInterval = setInterval(() => {
    i--;
    element.textContent = fromText.substring(0, i);
    
    if (i === 0) {
      clearInterval(deleteInterval);
      
      // Type new characters
      let j = 0;
      const typeInterval = setInterval(() => {
        j++;
        element.textContent = toText.substring(0, j);
        
        if (j === toText.length) {
          clearInterval(typeInterval);
          isAnimating = false;
          if (callback) callback();
        }
      }, 80);
    }
  }, 60);
}

if (krishLink) {
  krishLink.addEventListener('mouseenter', () => {
    // Typewriter effect: krish -> goat
    if (currentText === originalText) {
      typewriterEffect(krishLink, originalText, targetText, () => {
        currentText = targetText;
      });
    }
  });
  
  krishLink.addEventListener('mouseleave', () => {
    // Typewriter effect: goat -> krish
    if (currentText === targetText) {
      typewriterEffect(krishLink, targetText, originalText, () => {
        currentText = originalText;
      });
    }
  });
}

// Initialize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();


// Decrypted Text Effect
const decryptElements = document.querySelectorAll('.decrypt-text');
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+0123456789';

decryptElements.forEach(element => {
  const originalText = element.dataset.text || element.textContent;
  let interval = null;
  
  element.addEventListener('mouseenter', () => {
    clearInterval(interval);
    
    interval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((char) => {
          if (char === ' ') return ' ';
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');
    }, 50);
  });
  
  element.addEventListener('mouseleave', () => {
    clearInterval(interval);
    element.textContent = originalText;
  });
});

// Location Rotation with Typewriter Effect
const locationElement = document.querySelector('.location-decrypt');
if (locationElement) {
  const locations = JSON.parse(locationElement.dataset.locations);
  let currentIndex = 0;
  let interval = null;
  
  // Add cursor element
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  locationElement.parentNode.insertBefore(cursor, locationElement.nextSibling);
  
  function transitionToNext() {
    const currentText = locations[currentIndex];
    const nextIndex = (currentIndex + 1) % locations.length;
    const nextText = locations[nextIndex];
    
    let pos = currentText.length;
    let phase = 'erase'; // erase, type
    
    clearInterval(interval);
    
    interval = setInterval(() => {
      if (phase === 'erase') {
        // Erase from right to left
        pos--;
        locationElement.textContent = currentText.substring(0, pos);
        
        if (pos <= 0) {
          phase = 'type';
          pos = 0;
        }
      } else if (phase === 'type') {
        // Type from left to right
        pos++;
        locationElement.textContent = nextText.substring(0, pos);
        
        if (pos >= nextText.length) {
          currentIndex = nextIndex;
          clearInterval(interval);
          
          // Wait before next transition
          setTimeout(transitionToNext, 2500);
        }
      }
    }, 80);
  }
  
  // Start the rotation after initial delay
  setTimeout(transitionToNext, 2500);
}

// Portfolio loaded

// T-Rex Runner Game
const dinoCanvas = document.getElementById('dino-canvas');
const dinoOverlay = document.getElementById('dino-overlay');
const scoreDisplay = document.getElementById('dino-score');

if (dinoCanvas) {
  const dinoCtx = dinoCanvas.getContext('2d');
  
  // Game state
  let gameRunning = false;
  let gameOver = false;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('dinoHighScore')) || 0;
  let velocityX = -6; // Obstacle moving speed (like reference)
  let frameCount = 0;
  let obstacleInterval = null;
  
  // Set canvas size
  function resizeDinoCanvas() {
    const container = dinoCanvas.parentElement;
    dinoCanvas.width = container.clientWidth;
    dinoCanvas.height = 100;
  }
  
  resizeDinoCanvas();
  window.addEventListener('resize', resizeDinoCanvas);
  
  // Ground
  const groundY = dinoCanvas.height - 15;
  
  // Dino
  const dino = {
    x: 30,
    y: groundY,
    width: 44,
    height: 60,
    velocityY: 0,
    jumping: false,
    ducking: false
  };
  
  const gravity = 0.5;
  const jumpForce = -9;
  
  // Obstacles
  let obstacles = [];
  
  // Clouds
  let clouds = [];
  
  // Ground texture
  let groundOffset = 0;
  
  // Get colors based on theme
  function getGameColors() {
    return isDarkMode ? {
      bg: '#000000',
      fg: '#ffffff',
      dino: '#40e0d0',
      ground: '#333333'
    } : {
      bg: '#f5f5f5',
      fg: '#535353',
      dino: '#40e0d0',
      ground: '#cccccc'
    };
  }
  
  // Draw dino (Classic Chrome T-Rex pixel art style)
  function drawDino() {
    const colors = getGameColors();
    dinoCtx.fillStyle = colors.fg;
    
    const x = dino.x;
    const y = dino.y - dino.height;
    
    // Smaller pixel size for more detail
    const p = 1;
    
    if (dino.ducking) {
      // Ducking dino
      const dy = groundY - 30;
      // Long body
      dinoCtx.fillRect(x, dy + 10, 55, 14);
      // Head
      dinoCtx.fillRect(x + 45, dy + 4, 20, 12);
      dinoCtx.fillRect(x + 55, dy, 10, 8);
      // Eye
      dinoCtx.fillStyle = colors.bg;
      dinoCtx.fillRect(x + 58, dy + 3, 4, 4);
      // Legs
      dinoCtx.fillStyle = colors.fg;
      if (Math.floor(frameCount / 5) % 2 === 0) {
        dinoCtx.fillRect(x + 10, dy + 24, 6, 6);
        dinoCtx.fillRect(x + 24, dy + 24, 6, 3);
      } else {
        dinoCtx.fillRect(x + 10, dy + 24, 6, 3);
        dinoCtx.fillRect(x + 24, dy + 24, 6, 6);
      }
    } else {
      // Standing T-Rex (classic Chrome style - more detailed)
      // Head - top part
      dinoCtx.fillRect(x + 18, y, 22, 8);
      dinoCtx.fillRect(x + 16, y + 8, 26, 8);
      dinoCtx.fillRect(x + 18, y + 16, 24, 6);
      // Mouth area
      dinoCtx.fillRect(x + 30, y + 22, 12, 4);
      
      // Eye (cutout)
      dinoCtx.fillStyle = colors.bg;
      dinoCtx.fillRect(x + 32, y + 4, 5, 5);
      dinoCtx.fillStyle = colors.fg;
      
      // Neck and body
      dinoCtx.fillRect(x + 10, y + 22, 24, 20);
      dinoCtx.fillRect(x + 6, y + 26, 8, 14);
      
      // Tail
      dinoCtx.fillRect(x - 4, y + 24, 14, 8);
      dinoCtx.fillRect(x - 12, y + 22, 10, 6);
      dinoCtx.fillRect(x - 18, y + 20, 8, 5);
      dinoCtx.fillRect(x - 22, y + 18, 6, 4);
      
      // Arm
      dinoCtx.fillRect(x + 26, y + 32, 10, 4);
      dinoCtx.fillRect(x + 32, y + 36, 4, 5);
      
      // Legs animation
      if (dino.jumping) {
        // Both legs together when jumping
        dinoCtx.fillRect(x + 8, y + 42, 8, 16);
        dinoCtx.fillRect(x + 20, y + 42, 8, 16);
        // Feet
        dinoCtx.fillRect(x + 4, y + 56, 14, 4);
        dinoCtx.fillRect(x + 16, y + 56, 14, 4);
      } else {
        // Running animation
        if (Math.floor(frameCount / 5) % 2 === 0) {
          // Left leg forward
          dinoCtx.fillRect(x + 8, y + 42, 8, 16);
          dinoCtx.fillRect(x + 4, y + 56, 14, 4);
          // Right leg back
          dinoCtx.fillRect(x + 20, y + 42, 8, 10);
        } else {
          // Right leg forward
          dinoCtx.fillRect(x + 20, y + 42, 8, 16);
          dinoCtx.fillRect(x + 16, y + 56, 14, 4);
          // Left leg back
          dinoCtx.fillRect(x + 8, y + 42, 8, 10);
        }
      }
    }
  }
  
  // Draw cactus obstacle (classic Chrome style)
  function drawObstacle(obs) {
    const colors = getGameColors();
    dinoCtx.fillStyle = colors.fg;
    
    const x = obs.x;
    
    if (obs.type === 'small') {
      // Small single cactus
      dinoCtx.fillRect(x + 6, groundY - 34, 8, 34); // Main stem
      // Left arm
      dinoCtx.fillRect(x, groundY - 26, 8, 14);
      dinoCtx.fillRect(x + 6, groundY - 26, 8, 4);
      // Right arm
      dinoCtx.fillRect(x + 12, groundY - 20, 8, 10);
      dinoCtx.fillRect(x + 6, groundY - 20, 8, 4);
    } else if (obs.type === 'large') {
      // Large single cactus
      dinoCtx.fillRect(x + 8, groundY - 50, 10, 50); // Main stem
      // Left arm
      dinoCtx.fillRect(x, groundY - 38, 10, 18);
      dinoCtx.fillRect(x + 8, groundY - 38, 10, 5);
      // Right arm
      dinoCtx.fillRect(x + 16, groundY - 28, 10, 14);
      dinoCtx.fillRect(x + 8, groundY - 28, 10, 5);
    } else {
      // Group of cacti
      // First cactus (smaller)
      dinoCtx.fillRect(x + 4, groundY - 34, 7, 34);
      dinoCtx.fillRect(x, groundY - 26, 6, 12);
      dinoCtx.fillRect(x + 4, groundY - 26, 6, 4);
      dinoCtx.fillRect(x + 9, groundY - 18, 6, 8);
      dinoCtx.fillRect(x + 4, groundY - 18, 6, 4);
      // Second cactus (taller)
      dinoCtx.fillRect(x + 20, groundY - 44, 8, 44);
      dinoCtx.fillRect(x + 16, groundY - 34, 6, 14);
      dinoCtx.fillRect(x + 20, groundY - 34, 6, 4);
      dinoCtx.fillRect(x + 26, groundY - 24, 6, 10);
      dinoCtx.fillRect(x + 20, groundY - 24, 6, 4);
    }
  }
  
  // Draw cloud
  function drawCloud(cloud) {
    const colors = getGameColors();
    dinoCtx.fillStyle = colors.ground;
    dinoCtx.beginPath();
    dinoCtx.arc(cloud.x, cloud.y, 8, 0, Math.PI * 2);
    dinoCtx.arc(cloud.x + 12, cloud.y - 3, 6, 0, Math.PI * 2);
    dinoCtx.arc(cloud.x + 20, cloud.y, 8, 0, Math.PI * 2);
    dinoCtx.fill();
  }
  
  // Draw ground
  function drawGround() {
    const colors = getGameColors();
    dinoCtx.strokeStyle = colors.fg;
    dinoCtx.lineWidth = 1;
    
    // Main ground line
    dinoCtx.beginPath();
    dinoCtx.moveTo(0, groundY);
    dinoCtx.lineTo(dinoCanvas.width, groundY);
    dinoCtx.stroke();
    
    // Ground texture
    for (let i = -groundOffset; i < dinoCanvas.width; i += 20) {
      if (Math.random() > 0.7) {
        dinoCtx.beginPath();
        dinoCtx.moveTo(i, groundY + 5);
        dinoCtx.lineTo(i + 5, groundY + 5);
        dinoCtx.stroke();
      }
    }
  }
  
  // Generate cactus obstacle
  function generateRandomObstacle() {
    const types = ['small', 'large', 'group'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let width, height;
    if (type === 'small') {
      width = 20;
      height = 34;
    } else if (type === 'large') {
      width = 26;
      height = 50;
    } else {
      width = 34;
      height = 44;
    }
    
    return {
      x: dinoCanvas.width,
      width: width,
      height: height,
      type: type
    };
  }
  
  // Spawn obstacle (called by interval, like reference implementation)
  function placeCactus() {
    if (gameOver || !gameRunning) return;
    
    let chance = Math.random();
    
    // Different chances for different obstacle types
    if (chance > 0.85) {
      // 15% - spawn double obstacle (back to back)
      obstacles.push(generateRandomObstacle());
      const backToBack = generateRandomObstacle();
      backToBack.x = dinoCanvas.width + 80; // Gap for back-to-back
      obstacles.push(backToBack);
    } else {
      // 85% - spawn single obstacle (always spawn something)
      obstacles.push(generateRandomObstacle());
    }
  }
  
  // Spawn cloud
  function spawnCloud() {
    clouds.push({
      x: dinoCanvas.width,
      y: 15 + Math.random() * 25,
      speed: 1 + Math.random()
    });
  }
  
  // Check collision with cactus
  function checkCollision(obs) {
    const dinoHeight = dino.ducking ? 30 : dino.height;
    const dinoY = dino.ducking ? groundY - 30 : dino.y - dino.height;
    
    // Dino hitbox - smaller and more forgiving
    const dinoLeft = dino.x + 10;
    const dinoRight = dino.x + dino.width - 15;
    const dinoTop = dinoY + 10;
    const dinoBottom = dino.y; // Use actual dino y position (feet)
    
    // Obstacle hitbox - tighter around the cactus stem
    const obsLeft = obs.x + 6;
    const obsRight = obs.x + obs.width - 6;
    const obsTop = groundY - obs.height + 5;
    const obsBottom = groundY;
    
    return dinoRight > obsLeft &&
           dinoLeft < obsRight &&
           dinoBottom > obsTop &&
           dinoTop < obsBottom;
  }
  
  // Update game
  function updateGame() {
    if (!gameRunning || gameOver) return;
    
    frameCount++;
    
    // Update dino
    if (dino.jumping) {
      dino.velocityY += gravity;
      dino.y += dino.velocityY;
      
      if (dino.y >= groundY) {
        dino.y = groundY;
        dino.jumping = false;
        dino.velocityY = 0;
      }
    }
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x += velocityX; // Use velocityX like reference
      
      // Remove obstacle when off screen and add score
      if (obstacles[i].x + obstacles[i].width < 0) {
        obstacles.splice(i, 1);
        score++;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem('dinoHighScore', highScore);
        }
        scoreDisplay.textContent = score;
        
        // Gradual speed increase (make obstacles faster)
        velocityX -= 0.15;
        
        continue; // Skip collision check for removed obstacle
      }
      
      // Check collision when dino overlaps with obstacle x range
      if (obstacles[i].x < dino.x + dino.width && obstacles[i].x + obstacles[i].width > dino.x) {
        if (checkCollision(obstacles[i])) {
          gameOver = true;
          if (obstacleInterval) {
            clearInterval(obstacleInterval);
          }
          dinoOverlay.classList.remove('hidden');
          dinoOverlay.querySelector('span').textContent = `Game Over! Score: ${score} | Press Space to Restart`;
        }
      }
    }
    
    // Clean up old obstacles (keep array from growing)
    if (obstacles.length > 10) {
      obstacles.shift();
    }
    
    // Update clouds
    for (let i = clouds.length - 1; i >= 0; i--) {
      clouds[i].x -= clouds[i].speed;
      if (clouds[i].x + 50 < 0) {
        clouds.splice(i, 1);
      }
    }
    
    // Spawn clouds
    if (frameCount % 200 === 0) {
      spawnCloud();
    }
    
    // Update ground offset
    groundOffset = (groundOffset - velocityX) % 20;
    
    // Cap max speed
    if (velocityX < -14) {
      velocityX = -14;
    }
  }
  
  // Render game
  function renderGame() {
    const colors = getGameColors();
    
    // Clear canvas
    dinoCtx.fillStyle = colors.bg;
    dinoCtx.fillRect(0, 0, dinoCanvas.width, dinoCanvas.height);
    
    // Draw clouds
    clouds.forEach(drawCloud);
    
    // Draw ground
    drawGround();
    
    // Draw obstacles
    obstacles.forEach(drawObstacle);
    
    // Draw dino
    drawDino();
    
    // Game over text
    if (gameOver) {
      dinoCtx.fillStyle = colors.fg;
      dinoCtx.font = '16px monospace';
      dinoCtx.textAlign = 'center';
    }
  }
  
  // Game loop
  function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
  }
  
  // Start game
  function startGame() {
    // Clear any existing interval
    if (obstacleInterval) {
      clearInterval(obstacleInterval);
    }
    
    gameRunning = true;
    gameOver = false;
    score = 0;
    velocityX = -6;
    frameCount = 0;
    obstacles = [];
    clouds = [];
    dino.y = groundY;
    dino.jumping = false;
    dino.ducking = false;
    dino.velocityY = 0;
    scoreDisplay.textContent = '0';
    dinoOverlay.classList.add('hidden');
    
    // Start spawning obstacles at regular intervals (like reference: 1000ms)
    obstacleInterval = setInterval(placeCactus, 1000);
  }
  
  // Jump
  function jump() {
    if (!dino.jumping && !dino.ducking) {
      dino.jumping = true;
      dino.velocityY = jumpForce;
    }
  }
  
  // Duck
  function duck(isDucking) {
    if (!dino.jumping) {
      dino.ducking = isDucking;
    }
  }
  
  // Controls
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (!gameRunning || gameOver) {
        startGame();
      } else {
        jump();
      }
    }
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      duck(true);
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') {
      duck(false);
    }
  });
  
  // Click/touch to start or jump
  dinoCanvas.addEventListener('click', () => {
    if (!gameRunning || gameOver) {
      startGame();
    } else {
      jump();
    }
  });
  
  dinoOverlay.addEventListener('click', () => {
    startGame();
  });
  
  // Initial render
  renderGame();
  gameLoop();
}
