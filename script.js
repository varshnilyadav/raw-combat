/* ============================================================
   RAW COMBAT SPORTS — SCRIPTS
   Particles, Magnetic Buttons, Parallax, Marquee,
   Carousel, Count-Up, Lenis Smooth Scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     1. LENIS SMOOTH SCROLL
     ========================================================== */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        lenis.scrollTo(target, { offset: -72 });
        // Close mobile drawer if open
        closeMobileDrawer();
      }
    });
  });

  /* ==========================================================
     2. NAVIGATION
     ========================================================== */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Scroll-triggered nav background
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = mobileDrawer.classList.contains('open');
    if (isOpen) {
      closeMobileDrawer();
    } else {
      openMobileDrawer();
    }
  });

  mobileOverlay.addEventListener('click', closeMobileDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  function openMobileDrawer() {
    hamburger.classList.add('active');
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    hamburger.classList.remove('active');
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  /* ==========================================================
     3. HERO PARTICLE SYSTEM (Canvas)
     ========================================================== */
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 35 : 80;

  function resizeCanvas() {
    const hero = document.querySelector('.hero');
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = -(Math.random() * 0.4 + 0.1); // Float upward
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = Math.random() > 0.5 ? '#CC0000' : '#FFFFFF';
      this.life = Math.random() * 200 + 100;
      this.maxLife = this.life;
      this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      this.wobbleAmplitude = Math.random() * 30 + 10;
      this.wobbleOffset = Math.random() * Math.PI * 2;
    }

    update(frame) {
      this.x += this.speedX + Math.sin(frame * this.wobbleSpeed + this.wobbleOffset) * 0.3;
      this.y += this.speedY;
      this.life--;

      // Fade out near end of life
      if (this.life < 30) {
        this.opacity = (this.life / 30) * 0.6;
      }

      // Reset if off-screen or dead
      if (this.life <= 0 || this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
        this.y = canvas.height + 10;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();

      // Glow effect
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 3
      );
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.globalAlpha = this.opacity * 0.3;
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  }

  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  let animFrame = 0;

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animFrame++;

    particles.forEach(p => {
      p.update(animFrame);
      p.draw();
    });

    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ==========================================================
     4. HERO PARALLAX
     ========================================================== */
  const heroContent = document.getElementById('heroContent');
  const heroLogo = document.getElementById('heroLogo');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = document.querySelector('.hero').offsetHeight;

    if (scrollY < heroHeight) {
      const ratio = scrollY / heroHeight;
      // Move content up slower (parallax feel)
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = 1 - ratio * 1.2;

      // Logo moves at different rate
      heroLogo.style.transform = `translateY(${scrollY * 0.15}px)`;

      // Canvas particles parallax (move slower)
      canvas.style.transform = `translateY(${scrollY * 0.1}px)`;
    }
  }, { passive: true });

  /* ==========================================================
     5. SPRING-PHYSICS MAGNETIC BUTTONS
     ========================================================== */
  const magneticWraps = document.querySelectorAll('.magnetic-wrap');
  const MAGNETIC_RADIUS = 120;
  const MAGNETIC_STRENGTH = 0.35;

  magneticWraps.forEach(wrap => {
    const btn = wrap.querySelector('.magnetic-btn');
    if (!btn) return;

    // Only apply on devices with hover capability
    if (window.matchMedia('(hover: hover)').matches) {
      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist < MAGNETIC_RADIUS) {
          const pullX = distX * MAGNETIC_STRENGTH;
          const pullY = distY * MAGNETIC_STRENGTH;
          btn.style.transform = `translate(${pullX}px, ${pullY}px)`;
          btn.style.transition = 'transform 0.15s ease-out';
        }
      });

      wrap.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
    }

    // Mobile: pulse on tap
    btn.addEventListener('touchstart', () => {
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 200);
    }, { passive: true });
  });

  /* ==========================================================
     6. INTERACTIVE COUNT-UP STATS
     ========================================================== */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateStats();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  function animateStats() {
    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.target);
      const duration = 2000; // 2 seconds
      const startTime = performance.now();

      function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(updateCount);
    });
  }

  /* ==========================================================
     7. TESTIMONIAL CAROUSEL (Pause-on-Hover)
     ========================================================== */
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.testimonial-dot');
  const viewport = document.getElementById('testimonialViewport');
  const totalSlides = dots.length;
  let currentSlide = 0;
  let carouselInterval;
  let isPaused = false;

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    const next = (currentSlide + 1) % totalSlides;
    goToSlide(next);
  }

  function startCarousel() {
    carouselInterval = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, 4000);
  }

  startCarousel();

  // Pause on hover
  if (viewport) {
    viewport.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    viewport.addEventListener('mouseleave', () => {
      isPaused = false;
    });
  }

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      goToSlide(index);
    });
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  if (viewport) {
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isPaused = true;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left — next
          goToSlide((currentSlide + 1) % totalSlides);
        } else {
          // Swipe right — prev
          goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        }
      }

      setTimeout(() => { isPaused = false; }, 3000);
    }, { passive: true });
  }

  /* ==========================================================
     8. SCROLL REVEAL ANIMATIONS
     ========================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  /* ==========================================================
     9. PROGRAM CARD MAGNETIC EFFECT (Enhanced hover)
     ========================================================== */
  if (window.matchMedia('(hover: hover)').matches) {
    const programCards = document.querySelectorAll('.program-card');

    programCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -4;
        const rotateY = (x - centerX) / centerX * 4;

        card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
      });
    });
  }

  /* ==========================================================
     10. DYNAMIC YEAR UPDATE
     ========================================================== */
  // Keep copyright year current
  const yearEl = document.querySelector('.footer-bottom p');
  if (yearEl) {
    const currentYear = new Date().getFullYear();
    yearEl.innerHTML = `&copy; ${currentYear} RAW Combat Sports. Since 2014. All Rights Reserved.`;
  }

  /* ==========================================================
     11. PERFORMANCE-OPTIMIZED PARALLAX BACKGROUNDS
     ========================================================== */
  const parallaxSections = [];
  const parallaxElements = document.querySelectorAll('.parallax-bg-wrap');

  parallaxElements.forEach(wrap => {
    const section = wrap.parentElement;
    const img = wrap.querySelector('.parallax-bg-img');
    const speed = parseFloat(img.getAttribute('data-speed')) || -0.15;
    if (section && img) {
      parallaxSections.push({
        section,
        img,
        speed,
        isVisible: true // Start true for initial render on page load
      });
    }
  });

  function updateParallax(scrollY) {
    parallaxSections.forEach(item => {
      if (item.isVisible) {
        const relativeScroll = scrollY - item.section.offsetTop;
        const translation = relativeScroll * item.speed;
        item.img.style.transform = `translate3d(0, ${translation}px, 0)`;
      }
    });
  }

  // Intersection Observer to restrict parallax updates to onscreen sections
  const parallaxObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const targetSection = entry.target;
      const data = parallaxSections.find(item => item.section === targetSection);
      if (data) {
        data.isVisible = entry.isIntersecting;
      }
    });
  }, {
    threshold: 0,
    rootMargin: '150px 0px 150px 0px' // Start updates slightly before entry
  });

  parallaxSections.forEach(item => {
    parallaxObserver.observe(item.section);
  });

  // Connect parallax to Lenis smooth scroll updates
  lenis.on('scroll', () => {
    updateParallax(window.scrollY);
  });

  // Run initial translation positioning on load
  setTimeout(() => {
    updateParallax(window.scrollY);
  }, 100);

  /* ==========================================================
     12. PRELOADER FADE (Optional)
     ========================================================== */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });

});
