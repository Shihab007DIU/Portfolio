  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Intro loader
  (function initIntroLoader(){
    const loader = document.getElementById('introLoader');
    if(!loader) return;
    const seen = sessionStorage.getItem('introSeen');
    if(seen){
      loader.style.display = 'none';
      return;
    }
    gsap.to(loader.querySelector('.intro-text'), {opacity:1, y:0, duration:0.5, delay:0.15, ease:"power2.out", clearProps:"transform"});
    window.addEventListener('load', () => {
      gsap.to(loader, {
        opacity:0,
        duration:0.6,
        delay:0.6,
        ease:"power2.inOut",
        onComplete: () => { loader.style.display = 'none'; }
      });
      sessionStorage.setItem('introSeen', '1');
    });
  })();

  // Theme toggle (persisted) — animated sun/moon crossfade
  (function initThemeToggle(){
    const toggle = document.getElementById('themeToggle');
    if(!toggle) return;
    const root = document.documentElement;
    const sun = toggle.querySelector('.icon-sun');
    const moon = toggle.querySelector('.icon-moon');
    const saved = localStorage.getItem('theme');

    if(saved === 'light'){
      root.setAttribute('data-theme', 'light');
      gsap.set(sun, {opacity:0, rotation:-90});
      gsap.set(moon, {opacity:1, rotation:0});
    } else {
      gsap.set(sun, {opacity:1, rotation:0});
      gsap.set(moon, {opacity:0, rotation:90});
    }

    toggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      const hideEl = isLight ? moon : sun;
      const showEl = isLight ? sun : moon;

      gsap.to(hideEl, {opacity:0, rotation: isLight ? -90 : 90, duration:0.3, ease:"power2.inOut"});
      gsap.to(showEl, {opacity:1, rotation:0, duration:0.35, ease:"power2.inOut", delay:0.06});

      if(isLight){
        root.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
    });
  })();

  // Ambient background code lines
  const bgLines = document.getElementById('bgLines');
  const sample = [
    'function build(idea) { return ship(idea); }',
    'const learning = () => true;',
    'while(curious) { keep(building); }',
    'class Engineer { grow() {} }',
    'git commit -m "small, steady progress"',
    '// still figuring this part out',
    'export default determination;'
  ];
  let block = '';
  for(let i=0;i<40;i++){ block += sample[i % sample.length] + '\n'; }
  bgLines.textContent = block.repeat(3);

  // Slow parallax drift on the ambient background lines
  (function initBgParallax(){
    if(prefersReducedMotion) return;
    gsap.to(bgLines, {
      yPercent:-12,
      ease:"none",
      scrollTrigger:{
        trigger: document.body,
        start:"top top",
        end:"bottom bottom",
        scrub:true
      }
    });
  })();

  // Typed tagline
  const taglineText = "2nd year student at Daffodil International University, building my way toward becoming a full stack developer.";
  const typedEl = document.getElementById('typed');
  let i = 0;
  function typeChar(){
    if(i <= taglineText.length){
      typedEl.textContent = taglineText.slice(0, i);
      i++;
      setTimeout(typeChar, 22);
    }
  }
  window.addEventListener('load', () => setTimeout(typeChar, 400));

  // Hero heading — split into masked words for a staggered reveal
  (function initHeroHeadingReveal(){
    const h1 = document.querySelector('.hero h1');
    if(!h1) return;
    const lines = h1.innerHTML.split('<br>');
    const markup = lines.map((line) => {
      const words = line.trim().split(/\s+/).filter(Boolean);
      return words.map((w) => '<span class="word-mask"><span class="word-inner">' + w + '</span></span>').join(' ');
    }).join('<br>');
    h1.innerHTML = markup;

    gsap.set(h1.querySelectorAll('.word-inner'), {yPercent:110, opacity:0});
    gsap.to(h1.querySelectorAll('.word-inner'), {
      yPercent:0,
      opacity:1,
      duration:0.9,
      delay:0.35,
      stagger:0.09,
      ease:"power3.out",
      force3D:false,
      clearProps:"transform"
    });
  })();

  // Hero entrance
  gsap.from(".hero .eyebrow", {opacity:0, y:16, duration:0.7, delay:0.2});
  gsap.from(".photo-frame", {opacity:0, y:20, duration:0.9, delay:0.3, ease:"power3.out", clearProps:"all"});
  gsap.from(".floating-tag", {opacity:0, y:14, duration:0.6, delay:0.7, stagger:0.12, ease:"power2.out"});

  // Gentle continuous float for the hero tags
  document.querySelectorAll('.floating-tag').forEach((tag, idx) => {
    gsap.to(tag, {
      y: "+=10",
      duration: 2.4 + idx * 0.3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 1 + idx * 0.2
    });
  });

  // Custom magnetic cursor (desktop / fine-pointer only)
  (function initCustomCursor(){
    if(prefersReducedMotion || !isFinePointer) return;
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if(!dot || !ring) return;

    document.documentElement.classList.add('has-custom-cursor');
    gsap.set([dot, ring], {x:-100, y:-100});

    const setDotX = gsap.quickTo(dot, "x", {duration:0.12, ease:"power3.out"});
    const setDotY = gsap.quickTo(dot, "y", {duration:0.12, ease:"power3.out"});
    const setRingX = gsap.quickTo(ring, "x", {duration:0.45, ease:"power3.out"});
    const setRingY = gsap.quickTo(ring, "y", {duration:0.45, ease:"power3.out"});

    window.addEventListener('mousemove', (e) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);
    });

    document.addEventListener('mouseleave', () => {
      dot.classList.add('hidden');
      ring.classList.add('hidden');
    });
    document.addEventListener('mouseenter', () => {
      dot.classList.remove('hidden');
      ring.classList.remove('hidden');
    });

    const hoverables = 'a, button, .skill-tags span, .planned-card, .achievement-card, .interest-card, .edu-stat, .work-dot';
    document.querySelectorAll(hoverables).forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  })();

  // Subtle 3D tilt on the hero photo frame (desktop / fine-pointer only)
  (function initPhotoTilt(){
    const wrap = document.querySelector('.hero-photo');
    const frame = document.querySelector('.photo-frame');
    if(!wrap || !frame || prefersReducedMotion || !isFinePointer) return;
    const setRX = gsap.quickTo(frame, "rotationX", {duration:0.5, ease:"power3.out"});
    const setRY = gsap.quickTo(frame, "rotationY", {duration:0.5, ease:"power3.out"});
    wrap.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setRY(px * 14);
      setRX(-py * 14);
    });
    wrap.addEventListener('mouseleave', () => {
      setRX(0);
      setRY(0);
    });
  })();

  // Scroll reveals
  document.querySelectorAll('section').forEach((sec) => {
    const targets = sec.querySelectorAll('.section-tag, .section-note, .about-text p, .terminal, .edu-card, .edu-stat, .interest-card, .achievement-card, .empty-state, .goal-card, .planned-card, .target-block, .contact-inner .section-tag, .contact-inner h2, .contact-link, .hold-btn, .contact-form');
    gsap.from(targets, {
      scrollTrigger:{
        trigger: sec,
        start:"top 78%",
      },
      opacity:0,
      y:24,
      duration:0.7,
      stagger:0.08,
      ease:"power2.out",
      clearProps:"all"
    });
  });

  // Section headings — masked-word reveal on scroll (same language as the hero h1)
  (function initSectionHeadingReveal(){
    document.querySelectorAll('.section-head h2').forEach((h2) => {
      const words = h2.textContent.trim().split(/\s+/).filter(Boolean);
      h2.innerHTML = words.map((w) => '<span class="word-mask"><span class="word-inner">' + w + '</span></span>').join(' ');
      const inner = h2.querySelectorAll('.word-inner');
      gsap.set(inner, {yPercent:110, opacity:0});
      ScrollTrigger.create({
        trigger: h2,
        start:"top 85%",
        once:true,
        onEnter: () => {
          gsap.to(inner, {yPercent:0, opacity:1, duration:0.8, stagger:0.06, ease:"power3.out", force3D:false, clearProps:"transform"});
        }
      });
    });
  })();

  // Skill / certification columns — header fade + tag "wave" stagger
  document.querySelectorAll('.skill-groups').forEach((group) => {
    const headers = group.querySelectorAll('.skill-col h3');
    const tags = group.querySelectorAll('.skill-tags span');
    gsap.from(headers, {
      scrollTrigger:{ trigger: group, start:"top 80%" },
      opacity:0,
      y:14,
      duration:0.6,
      stagger:0.08,
      ease:"power2.out",
      clearProps:"all"
    });
    gsap.from(tags, {
      scrollTrigger:{ trigger: group, start:"top 80%" },
      opacity:0,
      y:10,
      scale:0.9,
      duration:0.5,
      stagger:0.035,
      ease:"power2.out",
      clearProps:"all"
    });
  });

  // Target-contest / goal-summary tag pills — same wave treatment
  document.querySelectorAll('.target-block .skill-tags, .goal-summary .skill-tags').forEach((group) => {
    gsap.from(group.querySelectorAll('span'), {
      scrollTrigger:{ trigger: group, start:"top 85%" },
      opacity:0,
      y:10,
      scale:0.9,
      duration:0.5,
      stagger:0.035,
      ease:"power2.out",
      clearProps:"all"
    });
  });

  // Avatar (circular profile photo) — opacity-only reveal, no transform,
  // so the round, clipped image never sits on a blurred compositing layer.
  document.querySelectorAll('.avatar').forEach((av) => {
    gsap.from(av, {
      scrollTrigger:{
        trigger: av,
        start:"top 85%",
      },
      opacity:0,
      duration:0.7,
      ease:"power2.out",
      clearProps:"all"
    });
  });

  // SVG icon draw-in for achievement & interest icons
  (function initIconDraw(){
    const icons = document.querySelectorAll('.achievement-icon, .interest-icon');
    icons.forEach((svg) => {
      const shapes = svg.querySelectorAll('path, circle, rect');
      shapes.forEach((shape) => {
        let length = 60;
        try { if(shape.getTotalLength) length = shape.getTotalLength(); } catch(e){}
        shape.style.strokeDasharray = length;
        shape.style.strokeDashoffset = length;
      });
      ScrollTrigger.create({
        trigger: svg,
        start:"top 88%",
        once:true,
        onEnter: () => {
          gsap.to(shapes, {
            strokeDashoffset:0,
            duration:0.9,
            stagger:0.12,
            delay:0.15,
            ease:"power2.out"
          });
        }
      });
    });
  })();

  // Count-up animation for GPA / CGPA / practice-platform figures
  document.querySelectorAll('.edu-stat-value[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const counter = { val: 0 };
    const decimals = el.getAttribute('data-count').includes('.') ? 2 : 0;
    ScrollTrigger.create({
      trigger: el,
      start:"top 85%",
      once:true,
      onEnter: () => {
        gsap.to(counter, {
          val: target,
          duration:1.1,
          ease:"power2.out",
          onUpdate: () => { el.textContent = counter.val.toFixed(decimals); }
        });
      }
    });
  });

  // Scroll progress bar
  const scrollFill = document.getElementById('scrollFill');
  function updateScrollProgress(){
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    scrollFill.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, {passive:true});
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();

  // Scroll-spy nav — highlights the current section's nav link
  (function initScrollSpy(){
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if(!navLinks.length) return;
    function setActive(activeLink){
      navLinks.forEach((l) => l.classList.toggle('active', l === activeLink));
    }
    navLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if(!section) return;
      ScrollTrigger.create({
        trigger: section,
        start:"top 50%",
        end:"bottom 50%",
        onEnter: () => setActive(link),
        onEnterBack: () => setActive(link)
      });
    });
  })();

  // Horizontal-scroll project section (desktop only) + progress dots
  ScrollTrigger.matchMedia({
    "(min-width: 761px)": function(){
      const track = document.querySelector('.work-track');
      if(!track) return;
      const dots = document.querySelectorAll('.work-dot');
      const getScrollAmount = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease:"none",
        scrollTrigger:{
          trigger:".work-pin",
          start:"top top",
          end: () => "+=" + getScrollAmount(),
          pin:true,
          scrub:0.6,
          invalidateOnRefresh:true,
          onUpdate: (self) => {
            if(!dots.length) return;
            const idx = Math.round(self.progress * (dots.length - 1));
            dots.forEach((d, di) => d.classList.toggle('active', di === idx));
          }
        }
      });
    }
  });

  // Magnetic hover pull on key buttons (desktop / fine-pointer only)
  (function initMagneticButtons(){
    if(prefersReducedMotion || !isFinePointer) return;
    document.querySelectorAll('.contact-link, .form-submit, .hold-btn, .project-play').forEach((btn) => {
      const setX = gsap.quickTo(btn, "x", {duration:0.35, ease:"power3.out"});
      const setY = gsap.quickTo(btn, "y", {duration:0.35, ease:"power3.out"});
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        setX(relX * 0.25);
        setY(relY * 0.35);
      });
      btn.addEventListener('mouseleave', () => {
        setX(0);
        setY(0);
      });
    });
  })();

  // Press & hold to copy email
  (function initHoldButton(){
    const btn = document.getElementById('holdBtn');
    if(!btn) return;
    const ring = document.getElementById('holdRingProgress');
    const label = document.getElementById('holdLabel');
    const defaultLabel = label.textContent;
    const circumference = 2 * Math.PI * 28;
    const email = 'mostakimislam.shihab@gmail.com';
    let holdTween;

    function startHold(e){
      e.preventDefault();
      if(btn.classList.contains('done')) return;
      btn.classList.add('active');
      holdTween = gsap.to(ring, {
        attr:{ strokeDashoffset: 0 },
        duration:0.9,
        ease:"none",
        onComplete: completeHold
      });
    }
    function cancelHold(){
      if(btn.classList.contains('done')) return;
      btn.classList.remove('active');
      if(holdTween) holdTween.kill();
      gsap.to(ring, { attr:{ strokeDashoffset: circumference }, duration:0.35, ease:"power2.out" });
    }
    function completeHold(){
      btn.classList.remove('active');
      btn.classList.add('done');
      if(navigator.clipboard){ navigator.clipboard.writeText(email).catch(()=>{}); }
      label.textContent = 'Copied to clipboard';
      setTimeout(() => {
        btn.classList.remove('done');
        label.textContent = defaultLabel;
        gsap.set(ring, { attr:{ strokeDashoffset: circumference } });
      }, 1800);
    }

    btn.addEventListener('pointerdown', startHold);
    btn.addEventListener('pointerup', cancelHold);
    btn.addEventListener('pointerleave', cancelHold);
    btn.addEventListener('pointercancel', cancelHold);
  })();

  // Contact form — opens a pre-filled Gmail compose tab, with animated checkmark on success
  (function initContactForm(){
    const form = document.getElementById('contactForm');
    if(!form) return;
    const status = document.getElementById('formStatus');
    const statusText = document.getElementById('formStatusText');
    const check = document.getElementById('formCheck');
    const RECIPIENT_EMAIL = 'mostakimislam.shihab@gmail.com';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      const subject = 'Portfolio message from ' + name;
      const body = message + '\n\n—\nFrom: ' + name + ' (' + email + ')';
      const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1'
        + '&to=' + encodeURIComponent(RECIPIENT_EMAIL)
        + '&su=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      window.open(gmailUrl, '_blank', 'noopener');

      statusText.textContent = "Opening Gmail — hit send there to finish.";
      status.className = 'form-status success';
      if(check) gsap.set(check, {strokeDashoffset:24});
      if(check) gsap.to(check, {strokeDashoffset:0, duration:0.5, ease:"power2.out", delay:0.05});
      form.reset();
    });
  })();
