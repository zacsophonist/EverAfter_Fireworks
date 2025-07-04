// Mobile Navigation
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');

  const icon = hamburger.querySelector('i');
  if (navLinks.classList.contains('active')) {
    icon.classList.replace('fa-bars', 'fa-times');
  } else {
    icon.classList.replace('fa-times', 'fa-bars');
  }
});

// Close mobile nav when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Manages the Services dropdown menu
const svcLink   = document.getElementById('services-link');
const toggleBtn = document.getElementById('services-toggle');
const dropdown  = document.querySelector('.has-dropdown .dropdown-menu');
const arrow     = document.querySelector('.dropdown-arrow');

toggleBtn.addEventListener('click', e => {
  e.stopPropagation();  // prevent this click from also triggering the link’s navigation
  const isOpen = dropdown.style.display === 'block';
  dropdown.style.display = isOpen ? 'none' : 'block';
  arrow.classList.toggle('rotate', !isOpen);
});

// Closes dropdown menu when user clicks anywhere else
document.addEventListener('click', () => {
  dropdown.style.display = 'none';
  arrow.classList.remove('rotate');
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

/* -------------------
   GALLERY SECTION
------------------- */

// Gallery filtering
const galleryFilters = document.querySelectorAll('.gallery-filter');
const galleryItems   = document.querySelectorAll('.gallery-item');

galleryFilters.forEach(filter => {
  filter.addEventListener('click', () => {
    // 1) Toggle active class on buttons
    galleryFilters.forEach(btn => btn.classList.remove('active'));
    filter.classList.add('active');

    const filterValue = filter.dataset.filter;

    // 2) Hide everything
    galleryItems.forEach(item => item.style.display = 'none');

    if (filterValue === 'all') {
      // 3a) “All” selected → show all
      galleryItems.forEach(item => item.style.display = 'block');
    } else {
      // 3b) Show only items whose data-category list includes the filter
      document
        .querySelectorAll(`.gallery-item[data-category~="${filterValue}"]`)
        .forEach(item => item.style.display = 'block');
    }
  });
});

// Grab modal elements and controls
const modal      = document.getElementById('imageModal');        // the overlay container
const modalImg   = document.getElementById('modalImage');        // <img> for image items
const modalVid   = document.getElementById('modalVideo');        // <video> for video items
const closeModal = document.querySelector('.close-modal');       // “×” button
const prevBtn    = document.querySelector('.modal-prev');        // left arrow
const nextBtn    = document.querySelector('.modal-next');        // right arrow
const filterBtns = document.querySelectorAll('.gallery-filter'); // filter buttons

let currentItems = [];   // array of .gallery-item elements currently visible by filter
let currentIndex = 0;    // index within currentItems of the one showing in modal

// Pauses and resets the modal video if active
function stopModalVideo() {
  modalVid.pause();
  modalVid.currentTime = 0;
}

// Build the array of items matching the active filter button
function updateCurrentItems() {
  const activeFilter = document.querySelector('.gallery-filter.active').dataset.filter;

  currentItems = Array.from(document.querySelectorAll('.gallery-item'))
    .filter(item => {
      // split the space-separated data-category into an array
      const cats = item.dataset.category.split(/\s+/);
      return activeFilter === 'all' || cats.includes(activeFilter);
    });
}

// Show the modal for the clicked thumbnail (image or video) and record its index
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    updateCurrentItems();
    currentIndex = currentItems.indexOf(item);

    // Determine if this item contains a video or image
    const imgEl = item.querySelector('img');
    const vidEl = item.querySelector('video');

    if (vidEl) {
      // Show video player
      modalImg.style.display = 'none';
      modalVid.src = vidEl.src;
      modalVid.style.display = 'block';
      modalVid.currentTime = 0; //rewind to start
      modalVid.play(); //start redering frames immediately
    
      // === GA4 Video Tracking now that the modal video is loaded ===
      if (typeof gtag === "function") {
        const milestones = { 10: false, 25: false, 50: false, 75: false };
    
        modalVid.addEventListener("play", () => {
          gtag("event", "video_play", { video_title: "EverAfterPromo.mp4" });
        });
    
        modalVid.addEventListener("ended", () => {
          gtag("event", "video_complete", { video_title: "EverAfterPromo.mp4" });
        });
    
        modalVid.addEventListener("timeupdate", () => {
          const percent = (modalVid.currentTime / modalVid.duration) * 100;
          [10, 25, 50, 75].forEach(t => {
            if (!milestones[t] && percent >= t) {
              gtag("event", `video_progress_${t}`, {
                video_title: "EverAfterPromo.mp4"
              });
              milestones[t] = true;
            }
          });
        });
      }
    } else {
      // Show static image
      modalVid.style.display = 'none';
      modalImg.src = imgEl.src;
      modalImg.style.display = 'block';
    }

    modal.style.display = 'block';
  });
});

// Move forwards or backwards through currentItems, wrapping around ends
function navigate(offset) {
  stopModalVideo();
  currentIndex = (currentIndex + offset + currentItems.length) % currentItems.length;
  const nextItem = currentItems[currentIndex];
  const imgEl = nextItem.querySelector('img');
  const vidEl = nextItem.querySelector('video');

  if (vidEl) {
    modalImg.style.display = 'none';
    modalVid.src = vidEl.src;
    modalVid.style.display = 'block';
    modalVid.currentTime = 0;    // rewind when arrow‑navigating
    modalVid.play();             // resume playback immediately
  } else {
    modalVid.style.display = 'none';
    modalImg.src = imgEl.src;
    modalImg.style.display = 'block';
  }
}

// Hook up arrow buttons to navigate
prevBtn.addEventListener('click', () => navigate(-1));
nextBtn.addEventListener('click', () => navigate(1));

// Allow left/right arrow keys and Escape to navigate or close
document.addEventListener('keydown', e => {
  if (modal.style.display === 'block') {
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'Escape')      closeModal.click();
  }
});

// Close modal on “×”
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
  stopModalVideo();              // ⟵ stop video playback
});

// Close modal when clicking outside
modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.style.display = 'none';
    stopModalVideo();            // ⟵ stop video playback
  }
});

// Whenever a filter button is clicked, update the array for arrow navigation
filterBtns.forEach(btn =>
  btn.addEventListener('click', () => {
    setTimeout(updateCurrentItems, 50);
  })
);


/* --------------------------- */


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
const thankYouMessage = document.getElementById('thankYouMessage');
const submitButton = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Fire Meta Pixel Lead event before submission
    if (typeof fbq === 'function') {
        fbq('track', 'Lead');
    }

    // Disable the button to prevent double submissions
    submitButton.disabled = true;
    submitButton.innerText = 'Sending...';

    const formData = new FormData(contactForm);

    // Slight delay to allow fbq request to go out
    setTimeout(() => {
        fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                if (typeof gtag === 'function') {
                  gtag('event', 'form_submit', {
                    event_category: 'Contact',
                    event_label: 'Main Contact Form'
                  });
                }
                contactForm.style.display = 'none';
                thankYouMessage.style.display = 'block';
                thankYouMessage.classList.add('fade-in');
                document.querySelector('.required-note').style.display = 'none'; // Hides "* = Required Field"
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });  // Scroll to top of Contact
            } else {
                alert('There was a problem submitting the form. Please try again.');
                submitButton.disabled = false;
                submitButton.innerText = 'Send Message';
            }
        }).catch(error => {
            alert('There was a problem submitting the form. Please try again.');
            submitButton.disabled = false;
            submitButton.innerText = 'Send Message';
        });
    }, 200); // 200ms pause for pixel tracking
});


/* --------Fireworks Animation---------- */


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

    class Firework {
        constructor(x, y, angle, color) {
          // position
          this.x = x;
          this.y = y;
      
          // remember launch point only for trail drawing
          this.coordinates     = Array(3).fill([x, y]);
          this.trail           = [];
          this.maxTrailLength  = 5;
      
          // motion
          this.angle       = angle;
          this.speed       = 12;    // initial “kick” speed
          this.acceleration= 0.98;  // <1 to slow down each frame
          this.gravity     = 0.2;   // pulls downward every frame
      
          // appearance
          this.hue         = color;
          this.brightness  = Math.random()*50 + 50;
        }
      
        update(i) {
          // — trail history —
          this.coordinates.pop();
          this.coordinates.unshift([this.x, this.y]);
          this.trail.unshift({ x:this.x, y:this.y, alpha:1 });
          if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
          }
      
          // — vertical step next frame —
          const dy = Math.sin(this.angle)*this.speed + this.gravity;
      
          // — apex detection —  
          // Once dy flips from negative (still rising) to >=0 (would start falling):
          if (dy >= -0.5) { //changed from 0, to explode earlier
            this.createParticles();
            fireworks.splice(i, 1);
            return;
          }
      
          // — keep climbing —  
          this.speed *= this.acceleration;
          this.x     += Math.cos(this.angle)*this.speed;
          this.y     += dy;
        }
      
        draw() {
          ctx.beginPath();
          // draw the luminous tracer
          for (let p of this.trail) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle   = `hsl(${this.hue},100%,${this.brightness}%)`;
            ctx.rect(p.x, p.y, 3, 3);
            p.alpha *= 0.9;
          }
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      
        createParticles() {
          for (let i=0; i<60; i++) {
            particles.push(new Particle(this.x, this.y, this.hue));
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

// For start/stop logic
let animationId = null;
let isRunning   = false;

function animate() {
  animationId = requestAnimationFrame(animate);
    
    // fade trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ~3% chance per frame to launch
    if (Math.random() < 0.04) {
        // choose angle ±50° around straight up
        const spreadDeg = 50;
        const deg       = Math.random()*2*spreadDeg - spreadDeg;  // -50…+50
        const angle     = (deg - 90) * Math.PI/180;               // -90° = up
    
        const color = Math.floor(Math.random()*360);
    
        // random initial speed 12–14
        const speed = 12 + Math.random()*2;
    
        // create and override its speed
        const fw = new Firework(
        canvas.width/2,
        canvas.height,
        angle,
        color
        );
        fw.speed = speed;
        fireworks.push(fw);
    }
    
    // update & draw fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    
    // update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        particles[i].update(i);
    }
}

// For the rest of the start/stop logic

// helpers to start / stop
function startFireworks() {
  if (!isRunning) {
    isRunning = true;
    animate();
  }
}
function stopFireworks() {
  if (isRunning) {
    cancelAnimationFrame(animationId);
    animationId = null;
    isRunning   = false;
  }
}

// kick off on page‐load
startFireworks();

// ---------------------------------
//   Hero (fireworks) pause/resume
// ---------------------------------
function handleHeroVisibility() {
  const hero         = document.querySelector('.hero');
  const scrollY      = window.scrollY;
  const threshold    = window.innerHeight * 0.7;

  if (scrollY > threshold) {
    hero.style.opacity       = '0';
    hero.style.pointerEvents = 'none';
    stopFireworks();
  } else {
    hero.style.opacity       = String(1 - scrollY/threshold);
    hero.style.pointerEvents = 'auto';
    startFireworks();
  }
}
window.addEventListener('scroll', handleHeroVisibility);


// ==========================
// Warns Firefox user about red weekend dates
// ==========================
// Returns True if browser is Firefox
function isFirefox() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}
const res = isFirefox()

// Edits the Date field in the contact form to warn a Firefox user about coloured dates
let cal = document.getElementById('firefoxWarning')
if (res) {
    cal.innerHTML = "Date of Wedding (Optional) <br> -Note: Weekend dates are automatically coloured red in Firefox browser. This does not reflect availability."
}

// Set today's date as minimum date
const weddingDateInput = document.getElementById('weddingDate');
if (weddingDateInput) {
    const today = new Date().toISOString().split('T')[0];
    weddingDateInput.setAttribute('min', today);

    const validationIcon = document.querySelector('.validation-icon');

    weddingDateInput.addEventListener('input', () => {
        if (weddingDateInput.value) {
            validationIcon.style.opacity = '1';
        } else {
            validationIcon.style.opacity = '0';
        }
    });
}

// === CUSTOM SCROLL DEPTH TRACKING on "/" page ===
const scrollPoints = [12, 26, 34, 42, 50, 63, 70, 81, 88];
const scrollFired = {};
scrollPoints.forEach(p => (scrollFired[p] = false));

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolledPercent = Math.round((scrollTop / docHeight) * 100);

  scrollPoints.forEach(threshold => {
    if (!scrollFired[threshold] && scrolledPercent >= threshold) {
      gtag("event", "scroll_depth", { percent_scrolled: threshold });
      scrollFired[threshold] = true;
    }
  });
});
