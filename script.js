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

// Location Rotation with Decrypt Effect
const locationElement = document.querySelector('.location-decrypt');
if (locationElement) {
  const locations = JSON.parse(locationElement.dataset.locations);
  let currentIndex = 0;
  let interval = null;
  let eraseInterval = null;
  
  function scrambleText(text) {
    return text.split('').map(char => {
      if (char === ' ') return ' ';
      return characters[Math.floor(Math.random() * characters.length)];
    }).join('');
  }
  
  function transitionToNext() {
    const currentText = locations[currentIndex];
    const nextIndex = (currentIndex + 1) % locations.length;
    const nextText = locations[nextIndex];
    
    let erasePos = currentText.length;
    let revealPos = 0;
    let phase = 'erase'; // erase, scramble, reveal
    let scrambleCount = 0;
    
    clearInterval(interval);
    
    interval = setInterval(() => {
      if (phase === 'erase') {
        // Erase from right to left
        erasePos--;
        const visible = currentText.substring(0, erasePos);
        const scrambled = scrambleText(currentText.substring(erasePos));
        locationElement.textContent = visible + scrambled.substring(0, currentText.length - erasePos);
        
        if (erasePos <= 0) {
          phase = 'scramble';
          scrambleCount = 0;
        }
      } else if (phase === 'scramble') {
        // Full scramble for a bit
        const maxLen = Math.max(currentText.length, nextText.length);
        locationElement.textContent = scrambleText(nextText.padEnd(maxLen, ' ')).trim();
        scrambleCount++;
        
        if (scrambleCount > 8) {
          phase = 'reveal';
          revealPos = 0;
        }
      } else if (phase === 'reveal') {
        // Reveal from left to right
        revealPos++;
        const revealed = nextText.substring(0, revealPos);
        const scrambled = scrambleText(nextText.substring(revealPos));
        locationElement.textContent = revealed + scrambled;
        
        if (revealPos >= nextText.length) {
          locationElement.textContent = nextText;
          currentIndex = nextIndex;
          clearInterval(interval);
          
          // Wait before next transition
          setTimeout(transitionToNext, 2500);
        }
      }
    }, 50);
  }
  
  // Start the rotation after initial delay
  setTimeout(transitionToNext, 2500);
}

// Portfolio loaded
