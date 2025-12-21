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

// Interactive Dot Grid with Gravity Well Effect
const canvas = document.getElementById('dot-canvas');
const ctx = canvas.getContext('2d');

// Dot grid settings - increase spacing on mobile for performance
let DOT_SPACING = window.innerWidth <= 600 ? 24 : 16;
const DOT_RADIUS = 1;
const GRAVITY_STRENGTH = 0.8;
const GRAVITY_RADIUS = 300;
const RETURN_SPEED = 0.03;

let dots = [];
let gravityWellActive = false;
let gravityCenter = { x: 0, y: 0 };
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
        y: j * DOT_SPACING,
        vx: 0,
        vy: 0
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
  
  // Draw dots
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
    if (gravityWellActive) {
      // Calculate distance to gravity center
      const dx = gravityCenter.x - dot.x;
      const dy = gravityCenter.y - dot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < GRAVITY_RADIUS && distance > 0) {
        // Apply gravity force (stronger when closer)
        const force = (1 - distance / GRAVITY_RADIUS) * GRAVITY_STRENGTH;
        dot.vx += (dx / distance) * force;
        dot.vy += (dy / distance) * force;
      }
    }
    
    // Return to original position
    const returnDx = dot.originalX - dot.x;
    const returnDy = dot.originalY - dot.y;
    dot.vx += returnDx * RETURN_SPEED;
    dot.vy += returnDy * RETURN_SPEED;
    
    // Apply velocity with damping
    dot.vx *= 0.9;
    dot.vy *= 0.9;
    dot.x += dot.vx;
    dot.y += dot.vy;
  }
}

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
    // Activate gravity well
    const rect = krishLink.getBoundingClientRect();
    gravityCenter.x = rect.left + rect.width / 2;
    gravityCenter.y = rect.top + rect.height / 2;
    gravityWellActive = true;
    
    // Typewriter effect: krish -> goat
    if (currentText === originalText) {
      typewriterEffect(krishLink, originalText, targetText, () => {
        currentText = targetText;
      });
    }
  });
  
  krishLink.addEventListener('mouseleave', () => {
    // Deactivate gravity well
    gravityWellActive = false;
    
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

// Target Cursor
const cursorWrapper = document.querySelector('.target-cursor-wrapper');
const corners = document.querySelectorAll('.target-cursor-corner');

// Check if mobile/touch device
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isMobile && cursorWrapper) {
  let mouseX = 0, mouseY = 0;
  let isActive = false;
  
  // Hide cursor wrapper by default
  cursorWrapper.style.opacity = '0';
  
  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (isActive) {
      cursorWrapper.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }
  });
  
  // Target hover effect
  const targets = document.querySelectorAll('.cursor-target');
  
  targets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      isActive = true;
      cursorWrapper.style.opacity = '1';
      document.body.style.cursor = 'none';
      target.style.cursor = 'none';
      
      const rect = target.getBoundingClientRect();
      const padding = 3;
      const cornerSize = 8;
      
      cursorWrapper.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      
      // Position corners exactly around the target element
      corners[0].style.transform = `translate(${rect.left - mouseX - padding}px, ${rect.top - mouseY - padding}px)`;
      corners[1].style.transform = `translate(${rect.right - mouseX + padding - cornerSize}px, ${rect.top - mouseY - padding}px)`;
      corners[2].style.transform = `translate(${rect.right - mouseX + padding - cornerSize}px, ${rect.bottom - mouseY + padding - cornerSize}px)`;
      corners[3].style.transform = `translate(${rect.left - mouseX - padding}px, ${rect.bottom - mouseY + padding - cornerSize}px)`;
    });
    
    target.addEventListener('mouseleave', () => {
      isActive = false;
      cursorWrapper.style.opacity = '0';
      document.body.style.cursor = '';
      target.style.cursor = '';
    });
  });
}

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
  let gameSpeed = 6;
  let frameCount = 0;
  
  // Set canvas size
  function resizeDinoCanvas() {
    const container = dinoCanvas.parentElement;
    dinoCanvas.width = container.clientWidth;
    dinoCanvas.height = 150;
  }
  
  resizeDinoCanvas();
  window.addEventListener('resize', resizeDinoCanvas);
  
  // Ground
  const groundY = dinoCanvas.height - 20;
  
  // Dino
  const dino = {
    x: 50,
    y: groundY,
    width: 40,
    height: 43,
    velocityY: 0,
    jumping: false,
    ducking: false
  };
  
  const gravity = 0.6;
  const jumpForce = -12;
  
  // Obstacles
  let obstacles = [];
  const obstacleTypes = [
    { width: 20, height: 35, type: 'cactus-small' },
    { width: 25, height: 50, type: 'cactus-large' },
    { width: 40, height: 30, type: 'cactus-group' }
  ];
  
  // Clouds
  let clouds = [];
  
  // Ground texture
  let groundOffset = 0;
  
  // Get colors based on theme
  function getGameColors() {
    return isDarkMode ? {
      bg: '#000000',
      fg: '#ffffff',
      ground: '#333333'
    } : {
      bg: '#f5f5f5',
      fg: '#535353',
      ground: '#cccccc'
    };
  }
  
  // Draw dino
  function drawDino() {
    const colors = getGameColors();
    dinoCtx.fillStyle = colors.fg;
    
    const dinoHeight = dino.ducking ? 25 : dino.height;
    const dinoY = dino.ducking ? groundY - 25 : dino.y - dino.height;
    
    // Body
    dinoCtx.fillRect(dino.x, dinoY, dino.width - 10, dinoHeight);
    
    // Head
    dinoCtx.fillRect(dino.x + 15, dinoY - 10, 25, 20);
    
    // Eye
    dinoCtx.fillStyle = colors.bg;
    dinoCtx.fillRect(dino.x + 30, dinoY - 5, 5, 5);
    
    // Legs animation
    dinoCtx.fillStyle = colors.fg;
    if (dino.jumping) {
      dinoCtx.fillRect(dino.x + 5, dinoY + dinoHeight, 8, 10);
      dinoCtx.fillRect(dino.x + 17, dinoY + dinoHeight, 8, 10);
    } else {
      if (Math.floor(frameCount / 5) % 2 === 0) {
        dinoCtx.fillRect(dino.x + 5, dinoY + dinoHeight, 8, 10);
      } else {
        dinoCtx.fillRect(dino.x + 17, dinoY + dinoHeight, 8, 10);
      }
    }
  }
  
  // Draw obstacle
  function drawObstacle(obs) {
    const colors = getGameColors();
    dinoCtx.fillStyle = colors.fg;
    
    if (obs.type === 'cactus-small') {
      dinoCtx.fillRect(obs.x, groundY - obs.height, obs.width, obs.height);
      dinoCtx.fillRect(obs.x - 5, groundY - obs.height + 10, 5, 15);
      dinoCtx.fillRect(obs.x + obs.width, groundY - obs.height + 15, 5, 10);
    } else if (obs.type === 'cactus-large') {
      dinoCtx.fillRect(obs.x, groundY - obs.height, obs.width, obs.height);
      dinoCtx.fillRect(obs.x - 8, groundY - obs.height + 15, 8, 20);
      dinoCtx.fillRect(obs.x + obs.width, groundY - obs.height + 10, 8, 25);
    } else {
      // Cactus group
      dinoCtx.fillRect(obs.x, groundY - 35, 15, 35);
      dinoCtx.fillRect(obs.x + 12, groundY - 45, 15, 45);
      dinoCtx.fillRect(obs.x + 24, groundY - 30, 15, 30);
    }
  }
  
  // Draw cloud
  function drawCloud(cloud) {
    const colors = getGameColors();
    dinoCtx.fillStyle = colors.ground;
    dinoCtx.beginPath();
    dinoCtx.arc(cloud.x, cloud.y, 15, 0, Math.PI * 2);
    dinoCtx.arc(cloud.x + 20, cloud.y - 5, 12, 0, Math.PI * 2);
    dinoCtx.arc(cloud.x + 35, cloud.y, 15, 0, Math.PI * 2);
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
  
  // Spawn obstacle
  function spawnObstacle() {
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    obstacles.push({
      x: dinoCanvas.width,
      ...type
    });
  }
  
  // Spawn cloud
  function spawnCloud() {
    clouds.push({
      x: dinoCanvas.width,
      y: 20 + Math.random() * 40,
      speed: 1 + Math.random()
    });
  }
  
  // Check collision
  function checkCollision(obs) {
    const dinoHeight = dino.ducking ? 25 : dino.height;
    const dinoY = dino.ducking ? groundY - 25 : dino.y - dino.height;
    
    // Smaller hitbox for more forgiving gameplay
    const hitboxPadding = 10;
    const dinoLeft = dino.x + hitboxPadding;
    const dinoRight = dino.x + dino.width - 15;
    const dinoTop = dinoY + hitboxPadding;
    const dinoBottom = dinoY + dinoHeight;
    
    const obsLeft = obs.x + 5;
    const obsRight = obs.x + obs.width - 5;
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
      obstacles[i].x -= gameSpeed;
      
      // Remove obstacle when off screen and add score
      if (obstacles[i].x + obstacles[i].width < 0) {
        obstacles.splice(i, 1);
        score++;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem('dinoHighScore', highScore);
        }
        scoreDisplay.textContent = score;
        continue; // Skip collision check for removed obstacle
      }
      
      // Only check collision if dino is near the obstacle
      if (obstacles[i].x < dino.x + dino.width + 20 && obstacles[i].x + obstacles[i].width > dino.x - 20) {
        if (checkCollision(obstacles[i])) {
          gameOver = true;
          dinoOverlay.classList.remove('hidden');
          dinoOverlay.querySelector('span').textContent = `Game Over! Score: ${score} | Press Space to Restart`;
        }
      }
    }
    
    // Spawn obstacles - ensure minimum distance between obstacles
    const minSpawnInterval = 80;
    const spawnInterval = Math.max(minSpawnInterval, 150 - Math.floor(score / 5) * 10);
    
    if (frameCount % spawnInterval === 0) {
      // Only spawn if there's enough distance from last obstacle
      const lastObstacle = obstacles[obstacles.length - 1];
      if (!lastObstacle || lastObstacle.x < dinoCanvas.width - 200) {
        spawnObstacle();
      }
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
    groundOffset = (groundOffset + gameSpeed) % 20;
    
    // Increase speed over time
    if (frameCount % 500 === 0 && gameSpeed < 15) {
      gameSpeed += 0.5;
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
    gameRunning = true;
    gameOver = false;
    score = 0;
    gameSpeed = 6;
    frameCount = 0;
    obstacles = [];
    clouds = [];
    dino.y = groundY;
    dino.jumping = false;
    dino.ducking = false;
    dino.velocityY = 0;
    scoreDisplay.textContent = '0';
    dinoOverlay.classList.add('hidden');
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
