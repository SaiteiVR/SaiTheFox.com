/* script.js */

// --- CONFIGURATION ---
// Replace these URLs with your actual transparent images of Saitei
const IMG_SITTING = "https://cdn-icons-png.flaticon.com/512/616/616430.png"; // Placeholder Cat Sit
const IMG_RUNNING = "https://cdn-icons-png.flaticon.com/512/616/616408.png"; // Placeholder Cat Run
const MAX_SPEED = 8; // Max pixels per frame (lower = slower)

// --- SETUP ---
const cursorDot = document.querySelector('.cursor-dot');
const chaser = document.querySelector('.cursor-chaser');
const chaserImg = chaser.querySelector('img');

let mouseX = 0, mouseY = 0;
let chaserX = 0, chaserY = 0;
let isRunning = false;

// 1. Track Mouse
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate dot movement
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

// 2. Physics Loop
function animate() {
    // Calculate distance
    let dx = mouseX - chaserX;
    let dy = mouseY - chaserY;
    let distance = Math.sqrt(dx*dx + dy*dy);

    // Only move if we are more than 5px away
    if (distance > 5) {
        
        // --- A. ROTATION ---
        // Calculate angle in radians
        let angle = Math.atan2(dy, dx); 
        // Convert to degrees. Note: Adjust +90 or -90 depending on your image orientation
        let degrees = angle * (180 / Math.PI); 
        
        // --- B. MAX SPEED LOGIC ---
        // We want to move towards target, but cap the speed
        // "Lerp" factor (smoothness)
        let vx = dx * 0.1;
        let vy = dy * 0.1;

        // Check if velocity exceeds max speed
        let velocity = Math.sqrt(vx*vx + vy*vy);
        if (velocity > MAX_SPEED) {
            let ratio = MAX_SPEED / velocity;
            vx *= ratio;
            vy *= ratio;
        }

        // Apply movement
        chaserX += vx;
        chaserY += vy;

        // Apply styles (Move + Rotate)
        // We use translate3d for performance, and rotate
        // Note: If your image faces RIGHT by default, use 'rotate(${degrees}deg)'
        // If it faces UP by default, use 'rotate(${degrees + 90}deg)'
        chaser.style.transform = `translate(${chaserX}px, ${chaserY}px) rotate(${degrees}deg) translate(-50%, -50%)`;

        // --- C. IMAGE SWAP (RUNNING) ---
        if (!isRunning) {
            chaserImg.src = IMG_RUNNING;
            isRunning = true;
        }

    } else {
        // --- D. IMAGE SWAP (SITTING) ---
        // We are close enough to stop
        if (isRunning) {
            chaserImg.src = IMG_SITTING;
            isRunning = false;
            // Reset rotation to 0 or keep last rotation? 
            // Usually reseting looks cleaner for "Sitting":
            chaser.style.transform = `translate(${chaserX}px, ${chaserY}px) rotate(0deg) translate(-50%, -50%)`;
        }
    }

    requestAnimationFrame(animate);
}

// Start Loop
animate();

// --- PARTICLES ---
const particleContainer = document.getElementById('particles');
if(particleContainer) {
    function createParticle() {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 15 + 5 + 'px';
        p.style.width = size;
        p.style.height = size;
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDuration = Math.random() * 5 + 5 + 's';
        particleContainer.appendChild(p);
        setTimeout(() => p.remove(), 10000);
    }
    setInterval(createParticle, 400);
}

// --- ACTIVE LINK HIGHLIGHT ---
// Automatically adds 'active' class to navbar link based on current URL
const currentPath = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll('.navbar a');
navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    }
});