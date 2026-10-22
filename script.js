// ===== ZAVIRO CLEANER WEBSITE – INTERAKTIONEN & ANIMATIONEN =====
(function () {
  'use strict'
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ===== TOPBAR: Scroll-Zustand + aktiver Nav-Link =====
  const topbar = document.getElementById('topbar')
  const navLinks = document.querySelectorAll('.nav-link')
  const sections = Array.from(document.querySelectorAll('main section[id]'))

  function onScrollChrome() {
    topbar.classList.toggle('scrolled', window.scrollY > 24)
  }
  window.addEventListener('scroll', onScrollChrome, { passive: true })
  onScrollChrome()

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const id = entry.target.id
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id))
    })
  }, { rootMargin: '-40% 0px -55% 0px' })
  sections.forEach(s => sectionObserver.observe(s))

  // ===== MOBILE BURGER =====
  const burger = document.getElementById('burger')
  burger?.addEventListener('click', () => topbar.classList.toggle('open'))
  navLinks.forEach(l => l.addEventListener('click', () => topbar.classList.remove('open')))

  // ===== SCROLL-REVEAL =====
  const revealEls = document.querySelectorAll('.reveal, .reveal-right')
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('visible'))
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          revealObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    revealEls.forEach(el => revealObserver.observe(el))
  }

  // ===== COUNTER (Zahlen zÃ¤hlen hoch) =====
  const counters = document.querySelectorAll('.counter')
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const el = entry.target
      counterObserver.unobserve(el)
      const target = parseInt(el.dataset.target, 10) || 0
      if (reduceMotion) { el.textContent = target; return }
      const duration = 1400
      const start = performance.now()
      function tick(now) {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = Math.round(target * eased)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  }, { threshold: 0.4 })
  counters.forEach(c => counterObserver.observe(c))

  // ===== PARALLAX (subtil, performant via rAF) =====
  const parallaxEls = document.querySelectorAll('[data-parallax]')
  if (!reduceMotion && parallaxEls.length) {
    let ticking = false
    function updateParallax() {
      const vh = window.innerHeight
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.05
        const rect = el.getBoundingClientRect()
        const center = rect.top + rect.height / 2 - vh / 2
        el.style.transform = 'translateY(' + (-center * speed).toFixed(1) + 'px)'
      })
      ticking = false
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateParallax) }
    }, { passive: true })
    updateParallax()
  }

  // ===== MAUS-REFLEX AUF GLASS-KARTEN (glow-card) =====
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.glow-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%')
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%')
      })
    })
  }

  // ===== PARTIKEL-HINTERGRUND (Canvas) =====
  const canvas = document.getElementById('particles')
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d')
    let W, H, particles
    const COUNT = Math.min(70, Math.floor(window.innerWidth / 22))

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    function spawn() {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        a: Math.random() * 0.5 + 0.15,
        hue: Math.random() > 0.7 ? 186 : 258
      }))
    }
    function draw() {
      ctx.clearRect(0, 0, W, H)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'hsla(' + p.hue + ', 90%, 70%, ' + p.a + ')'
        ctx.fill()
      }
      // dÃ¼nne Verbindungen
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < 120 * 120) {
            ctx.strokeStyle = 'rgba(124, 92, 255, ' + (0.06 * (1 - d2 / 14400)).toFixed(3) + ')'
            ctx.lineWidth = 0.6
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
      }
      requestAnimationFrame(draw)
    }
    resize(); spawn(); draw()
    window.addEventListener('resize', () => { resize(); spawn() })
  }

  // ===== SPENDEN: Danke-Karte nach RÃ¼ckkehr von PayPal =====
  const donateButton = document.getElementById('donate-button')
  const donatePrompt = document.getElementById('donate-prompt')
  const donateThanks = document.getElementById('donate-thanks')
  let donateWindow = null

  function showDonateThanks() {
    if (donatePrompt) donatePrompt.hidden = true
    if (donateThanks) donateThanks.hidden = false
  }

  if (donateButton && donatePrompt && donateThanks) {
    donateButton.addEventListener('click', () => {
      // PayPal in einem eigenen Fenster Ã¶ffnen, damit wir das SchlieÃŸen
      // erkennen kÃ¶nnen â€“ danach zeigen wir die Danke-Karte.
      donateWindow = window.open(donateButton.href, 'zaviro_donate', 'width=520,height=720,noopener')
      if (!donateWindow) {
        // Popup blockiert: Tab Ã¶ffnet sich normal, Danke-Karte trotzdem vorbereiten
        setTimeout(showDonateThanks, 1200)
      }
    })

    // Fallback: Wenn der Nutzer zurÃ¼ck auf diesen Tab wechselt, gilt die Spende als abgeschlossen.
    window.addEventListener('focus', () => {
      if (donateWindow && donateWindow.closed) {
        donateWindow = null
        showDonateThanks()
      }
    })

    document.getElementById('donate-thanks-back')?.addEventListener('click', () => {
      if (donatePrompt) donatePrompt.hidden = false
      if (donateThanks) donateThanks.hidden = true
    })

    // Direktaufruf: steuert man spongen.html / #danke an, sofort danken.
    if (location.hash === '#danke') showDonateThanks()
  }
})()
