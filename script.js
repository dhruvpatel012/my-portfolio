document.addEventListener('DOMContentLoaded', () => {
  
  // Lucide icons
  lucide.createIcons();

  // Lenis smooth scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // Connect ScrollTrigger to Lenis scroll (driven cleanly by GSAP ticker)
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Mobile drawer elements & helper
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileDrawer = document.querySelector('.nav-mobile-drawer');

  // Smooth scroll to sections from links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        closeMobileMenu();
        lenis.start();
        lenis.scrollTo(targetEl, {
          offset: -80,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      }
    });
  });

  const isDesktopScreen = () => window.matchMedia('(min-width: 1025px)').matches;

  // Custom cursor and spotlight glow (Desktop only)
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const cursorGlow = document.getElementById('cursorGlow');
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  if (isDesktopScreen()) {
    let ringX = mouseX;
    let ringY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;
      
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
      cursorGlow.style.opacity = '1';
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    function updateCursorElements() {
      if (isMoving) {
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        
        glowX += (mouseX - glowX) * 0.04;
        glowY += (mouseY - glowY) * 0.04;
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(updateCursorElements);
    }
    requestAnimationFrame(updateCursorElements);

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      cursorGlow.style.opacity = '0';
    });

    const expandElements = document.querySelectorAll('[data-cursor-expand]');
    expandElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('expand'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('expand'));
    });
  }

  // Canvas plexus background animation (Responsive particle count)
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  
  let canvasW = canvas.width = window.innerWidth;
  let canvasH = canvas.height = window.innerHeight;
  
  function getParticleCount() {
    const w = window.innerWidth;
    if (w >= 1025) return 55;
    if (w >= 769) return 25;
    return 12;
  }

  const particlesList = [];

  class PlexusParticle {
    constructor() {
      this.reset(true);
    }
    
    reset(initial = false) {
      this.x = Math.random() * canvasW;
      this.y = initial ? Math.random() * canvasH : (Math.random() > 0.5 ? 0 : canvasH);
      this.radius = Math.random() * 1.5 + 1;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.color = `rgba(216, 255, 0, ${Math.random() * 0.3 + 0.35})`;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (isDesktopScreen()) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < 32400) {
          const dist = Math.sqrt(distSq);
          this.x += (dx / dist) * 0.18;
          this.y += (dy / dist) * 0.18;
        }
      }
      
      if (this.x < 0) { this.x = 0; this.vx *= -1; }
      if (this.x > canvasW) { this.x = canvasW; this.vx *= -1; }
      if (this.y < 0) { this.y = 0; this.vy *= -1; }
      if (this.y > canvasH) { this.y = canvasH; this.vy *= -1; }
    }
    
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particlesList.length = 0;
    const targetCount = getParticleCount();
    for (let i = 0; i < targetCount; i++) {
      particlesList.push(new PlexusParticle());
    }
  }
  initParticles();

  window.addEventListener('resize', () => {
    canvasW = canvas.width = window.innerWidth;
    canvasH = canvas.height = window.innerHeight;
    const targetCount = getParticleCount();
    if (particlesList.length !== targetCount) {
      initParticles();
    }
  });

  function drawFrame() {
    if (document.hidden) {
      requestAnimationFrame(drawFrame);
      return;
    }

    ctx.clearRect(0, 0, canvasW, canvasH);
    const count = particlesList.length;
    
    for (let i = 0; i < count; i++) {
      particlesList[i].update();
      particlesList[i].draw();
    }
    
    const maxDistance = 125;
    const maxDistanceSq = 15625;
    const mouseMaxDistance = 165;
    const mouseMaxDistanceSq = 27225;
    const checkMouse = isDesktopScreen();
    
    for (let i = 0; i < count; i++) {
      const p1 = particlesList[i];
      
      for (let j = i + 1; j < count; j++) {
        const p2 = particlesList[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < maxDistanceSq) {
          const dist = Math.sqrt(distSq);
          const opacity = (1 - dist / maxDistance) * 0.12;
          ctx.strokeStyle = `rgba(216, 255, 0, ${opacity})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      
      if (checkMouse) {
        const mdx = p1.x - mouseX;
        const mdy = p1.y - mouseY;
        const mdistSq = mdx * mdx + mdy * mdy;
        
        if (mdistSq < mouseMaxDistanceSq) {
          const mdist = Math.sqrt(mdistSq);
          const opacity = (1 - mdist / mouseMaxDistance) * 0.28;
          ctx.strokeStyle = `rgba(216, 255, 0, ${opacity})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(drawFrame);
  }
  requestAnimationFrame(drawFrame);

  // Magnetic hover effect (Desktop only)
  if (isDesktopScreen()) {
    const magnetics = document.querySelectorAll('.magnetic');
    magnetics.forEach(el => {
      let isHovered = false;
      el.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      el.addEventListener('mouseenter', () => { isHovered = true; });
      el.addEventListener('mouseleave', () => {
        isHovered = false;
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'power3.out'
        });
      });
    });
  }

  // Header scroll & back to top behavior
  let lastScroll = 0;
  const header = document.querySelector('.header');
  const backToTop = document.getElementById('backToTop');
  
  if (header) {
    lenis.on('scroll', (e) => {
      const currentScroll = e.scroll;
      
      if (currentScroll > 50) {
        header.style.background = 'rgba(3, 3, 3, 0.85)';
        header.style.backdropFilter = 'blur(16px)';
        
        if (currentScroll > lastScroll && currentScroll > 100) {
          header.classList.add('hide');
        } else {
          header.classList.remove('hide');
        }
      } else {
        header.style.background = 'rgba(3, 3, 3, 0.6)';
        header.style.backdropFilter = 'blur(12px)';
        header.classList.remove('hide');
      }

      if (backToTop) {
        if (currentScroll > 600) {
          backToTop.style.opacity = '1';
          backToTop.style.pointerEvents = 'auto';
          backToTop.style.transform = 'translateY(0)';
        } else {
          backToTop.style.opacity = '0';
          backToTop.style.pointerEvents = 'none';
          backToTop.style.transform = 'translateY(15px)';
        }
      }
      
      lastScroll = currentScroll;
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      lenis.scrollTo(0, {
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    });
  }

  // Mobile drawer menu
  function closeMobileMenu() {
    if (menuToggle && menuToggle.classList.contains('open')) {
      menuToggle.classList.remove('open');
      if (mobileDrawer) mobileDrawer.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      lenis.start();
    }
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.classList.toggle('open');
      mobileDrawer.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      
      if (isOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });
  }

  // Page loader and hero animation
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const loaderPercent = document.getElementById('loaderPercent');
  
  let currentVal = 0;
  const countDuration = 2000;
  const stepTime = Math.abs(Math.floor(countDuration / 100));
  
  const initHeroAnimations = () => {
    const tl = gsap.timeline();
    document.body.classList.remove('loading');
    
    tl.from('.hero-badge', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out'
    })
    .from('.hero-title .title-line', {
      y: 80,
      opacity: 0,
      duration: 1.0,
      stagger: 0.15,
      ease: 'power4.out'
    }, '-=0.4')
    .from('.hero-subtitle', {
      opacity: 0,
      y: 25,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6')
    .from('.hero-actions .btn', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out'
    }, '-=0.5')
    .from('.hero-scroll-indicator', {
      opacity: 0,
      y: -10,
      duration: 0.5,
      ease: 'power3.out'
    }, '-=0.3');
  };

  const loaderTimer = setInterval(() => {
    currentVal++;
    loaderPercent.innerText = currentVal;
    loaderBar.style.width = currentVal + '%';
    
    if (currentVal >= 100) {
      clearInterval(loaderTimer);
      
      const exitTimeline = gsap.timeline({
        onComplete: initHeroAnimations
      });
      
      exitTimeline.to('.loader-progress-wrap', {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: 'power2.in'
      })
      .to('.loader-name, .loader-track', {
        opacity: 0,
        y: -20,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power2.in'
      }, '-=0.15')
      .to(loader, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.8,
        ease: 'power4.inOut'
      }, '+=0.1')
      .set(loader, { display: 'none' });
    }
  }, stepTime);

  gsap.to('.loader-name', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 });
  gsap.to('.loader-track', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.35 });

  // ScrollTrigger animations
  gsap.registerPlugin(ScrollTrigger);

  // Section Headers Reveal
  const sectionHeaders = document.querySelectorAll('.section-header');
  sectionHeaders.forEach(header => {
    gsap.from(header, {
      scrollTrigger: {
        trigger: header,
        start: 'top 88%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 25, // Softened translation distance
      duration: 1.2, // Increased from 0.8s
      ease: 'power4.out' // Smoother cubic-bezier decay
    });
  });

  // About Section Animations
  gsap.from('.about-info', {
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top 82%',
    },
    opacity: 0,
    x: -25,
    duration: 1.4, // Smoother glide
    ease: 'power4.out'
  });

  gsap.from('.stat-card', {
    scrollTrigger: {
      trigger: '.about-stats',
      start: 'top 82%',
    },
    opacity: 0,
    scale: 0.95,
    y: 20,
    stagger: 0.08,
    duration: 1.2,
    ease: 'power4.out'
  });

  // Card & Staggered Tag Entry Reveal Helper
  function animateCardWithTags(selector) {
    const cards = document.querySelectorAll(selector);
    cards.forEach(card => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
        },
        opacity: 0,
        y: 25,
        duration: 1.2,
        ease: 'power4.out',
        onStart: () => {
          const tags = card.querySelectorAll('.skill-tag');
          gsap.fromTo(tags, 
            { opacity: 0, scale: 0.8, y: 10 },
            { 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              duration: 0.6, 
              stagger: 0.03,
              ease: 'back.out(1.2)',
              overwrite: 'auto'
            }
          );
        }
      });
    });
  }

  // Skills Categories Card & Projects Section Reveal & Stagger
  animateCardWithTags('.skill-category-card');
  animateCardWithTags('.project-card');


  // Timeline Progress Track drawing
  gsap.to('.timeline-line-progress', {
    scrollTrigger: {
      trigger: '.timeline-container',
      start: 'top 35%',
      end: 'bottom 65%',
      scrub: true
    },
    height: '100%',
    ease: 'none'
  });

  // Timeline Items Reveal Left / Right
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => {
    const content = item.querySelector('.timeline-content');
    const dot = item.querySelector('.timeline-dot');
    const direction = item.classList.contains('left-item') ? -25 : 25;
    
    gsap.from(content, {
      scrollTrigger: {
        trigger: item,
        start: 'top 82%',
      },
      opacity: 0,
      x: direction,
      duration: 1.2,
      ease: 'power4.out'
    });

    gsap.from(dot, {
      scrollTrigger: {
        trigger: item,
        start: 'top 82%',
      },
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'back.out(1.5)'
    });
  });

  // Contact Info & Form Reveal
  gsap.from('.contact-info-card', {
    scrollTrigger: {
      trigger: '.contact-section',
      start: 'top 82%',
    },
    opacity: 0,
    x: -20,
    stagger: 0.1,
    duration: 1.2,
    ease: 'power4.out'
  });

  gsap.from('.contact-form-wrap', {
    scrollTrigger: {
      trigger: '.contact-section',
      start: 'top 78%',
    },
    opacity: 0,
    x: 20,
    duration: 1.4,
    ease: 'power4.out'
  });

  // Active nav link highlight
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    const id = section.getAttribute('id');
    ScrollTrigger.create({
      trigger: section,
      start: 'top 20%',
      end: 'bottom 20%',
      onEnter: () => activateLink(id),
      onEnterBack: () => activateLink(id)
    });
  });

  function activateLink(id) {
    document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('active');
      }
    });
  }



  // Contact form submission and validation
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('name').value.trim();
    const emailInput = document.getElementById('email').value.trim();
    const messageInput = document.getElementById('message').value.trim();
    
    if (!nameInput || !emailInput || !messageInput) {
      formStatus.innerText = 'Please fill out all fields.';
      formStatus.className = 'form-status error';
      return;
    }
    
    formStatus.innerText = 'Sending message...';
    formStatus.className = 'form-status';
    
    const formData = new FormData(contactForm);
    
    fetch(contactForm.action, {
      method: contactForm.method,
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        formStatus.innerText = 'Thank you! Your message has been sent successfully.';
        formStatus.className = 'form-status success';
        contactForm.reset();
        
        setTimeout(() => {
          formStatus.innerText = '';
        }, 5000);
      } else {
        response.json().then(data => {
          if (data && data.errors) {
            formStatus.innerText = data.errors.map(error => error.message).join(', ');
          } else {
            formStatus.innerText = 'Oops! There was a problem submitting your form.';
          }
          formStatus.className = 'form-status error';
        });
      }
    })
    .catch(error => {
      formStatus.innerText = 'Oops! There was a problem submitting your form.';
      formStatus.className = 'form-status error';
    });
  });
}
});
