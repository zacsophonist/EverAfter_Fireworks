// Mobile Navigation
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.innerHTML = navLinks.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Close mobile nav when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Scroll to top button
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Gallery filtering
const galleryFilters = document.querySelectorAll('.gallery-filter');
const galleryItems = document.querySelectorAll('.gallery-item');

galleryFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        // Update active filter button
        galleryFilters.forEach(btn => btn.classList.remove('active'));
        filter.classList.add('active');
        
        const filterValue = filter.getAttribute('data-filter');
        
        galleryItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Gallery modal
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeModal = document.getElementsByClassName('close-modal')[0];

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        modal.style.display = 'block';
        modalImg.src = item.querySelector('img').src;
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Intersection Observer for fade-in animations
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

fadeElements.forEach(element => {
    element.style.opacity = 0;
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(element);
});

// Form submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Here you would normally handle form submission to a server
    // For GitHub Pages, you might use a service like Formspree
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
});

// Canvas Fireworks Animation
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Firework class
class Firework {
    constructor(x, y, targetX, targetY, color) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.distanceToTarget = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        this.speed = 1.2; // Reduced from 2 to slow down launch
        this.friction = 0.98;
        this.gravity = 0.8; // Reduced from 1 to make it more floaty
        this.hue = color || Math.floor(Math.random() * 360);
        this.brightness = Math.random() * 50 + 50;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.02;
        this.trail = [];
        this.maxTrailLength = 5;
        
        // Initialize coordinates
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.speed = 1.2; // Reduced from 2 to slow down launch
        this.acceleration = 1.03; // Reduced from 1.05 for slower acceleration
        this.brightness = Math.random() * 50 + 50;
        
        // Explosion particles
        this.particles = [];
    }
    
    update(index) {
        // Remove last coordinate and add current
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        
        // Add trail effect
        this.trail.unshift({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
        
        // Calculate distance traveled
        this.distanceTraveled = Math.sqrt(Math.pow(this.x - this.startX, 2) + Math.pow(this.y - this.startY, 2));
        
        // If target reached, explode
        if (this.distanceTraveled >= this.distanceToTarget) {
            this.createParticles();
            // Remove firework
            fireworks.splice(index, 1);
        } else {
            // Move towards target
            this.speed *= this.acceleration;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
        }
    }
    
    draw() {
        ctx.beginPath();
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            ctx.globalAlpha = point.alpha;
            ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
            ctx.rect(point.x, point.y, 3, 3);
            point.alpha *= 0.9;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    createParticles() {
        const particleCount = 60;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(this.targetX, this.targetY, this.hue));
        }
    }
}

// Particle class
class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        
        // Initialize coordinates
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        
        // Random angle and speed
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 6 + 1; // Reduced from 10+2 to slow down particles
        this.friction = 0.95;
        this.gravity = 0.6; // Reduced from 0.98 to make particles more floaty
        this.hue = Math.random() * 50 + hue - 25;
        this.brightness = Math.random() * 20 + 80;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.02;
    }
    
    update(index) {
        // Remove last coordinate and add current
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        
        // Slow down
        this.speed *= this.friction;
        
        // Apply gravity and direction
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        
        // Fade out
        this.alpha -= this.decay;
        
        // Remove particle if alpha too low
        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        
        // Draw circle
        ctx.arc(this.x, this.y, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
}

// Create and store fireworks and particles
let fireworks = [];
let particles = [];

// Initial hue
let hue = 120;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Clear canvas with semi-transparent black
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Random firework creation - reduced frequency
    if (Math.random() < 0.02) { // Reduced from 0.05 to create fireworks less frequently
        const x = canvas.width * Math.random();
        const y = canvas.height * Math.random();
        const color = Math.floor(Math.random() * 360);
        fireworks.push(new Firework(
            canvas.width / 2,
            canvas.height,
            x,
            y,
            color
        ));
    }
    
    // Update and draw fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        particles[i].update(i);
    }
    
    // Cycle hue more slowly
    hue += 0.3; // Reduced from 0.5 for slower color transitions
}

// Start animation
animate();