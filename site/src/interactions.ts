// interactions.ts — round 16 asset layer, native/hand-rolled (MIT-by-construction,
// zero dependency). Licence fork recorded in ASSET_BOARD_r16.md s0: Unlumen UI's
// own catalogue names these five effects but its licence is not MIT/OFL, so every
// effect here is a small hand-rolled substitute instead of an installed component.
// Each function is a no-op (or renders the final state immediately) under
// prefers-reduced-motion, per DESIGN.md and the round-16 RULES line.

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// ---- Tilt Card (substitutes Unlumen UI "Tilt Card") ----
// WORK and REPOS cards: bounded perspective tilt toward the pointer, reset on leave.
export function initTiltCards() {
  if (reducedMotion()) return
  document.querySelectorAll<HTMLElement>('.tilt').forEach((card) => {
    const max = 6 // degrees, deliberately small — DESIGN.md bans anything showy
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      card.style.transform = `perspective(700px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)'
    })
  })
}

// ---- Magnetic Button (substitutes Unlumen UI "Magnetic Button") ----
// Primary CTA only, per DESIGN.md s3 (one primary action).
export function initMagneticButton() {
  if (reducedMotion()) return
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((btn) => {
    const radius = 60
    const pull = 0.35
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const dist = Math.hypot(dx, dy)
      if (dist < radius) {
        btn.style.transform = `translate(${(dx * pull).toFixed(1)}px, ${(dy * pull).toFixed(1)}px)`
      }
    })
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)'
    })
  })
}

// ---- Text Reveal (substitutes Unlumen UI "Text Reveal") ----
// Wraps each word of a `.reveal-text` element in a span and fades/lifts them in,
// once, on first scroll-into-view. Static text under reduced motion (words are
// still wrapped for consistent markup but the CSS transition is disabled globally).
export function initTextReveal() {
  const els = document.querySelectorAll<HTMLElement>('.reveal-text')
  els.forEach((el) => {
    const words = el.textContent?.split(' ') ?? []
    el.textContent = ''
    words.forEach((w, i) => {
      const span = document.createElement('span')
      span.className = 'reveal-word'
      span.style.transitionDelay = `${i * 35}ms`
      span.textContent = w
      el.append(span, document.createTextNode(' '))
    })
  })
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.4 },
  )
  els.forEach((el) => io.observe(el))
}

// ---- Count Up (substitutes Magic UI "Number Ticker") ----
// data-target holds the final integer; data-sep="," inserts a thousands
// separator rendered in the body face (see styles.css .num-sep note).
export function initCountUp() {
  const els = document.querySelectorAll<HTMLElement>('.count-up')
  const render = (el: HTMLElement, n: number, grouped: boolean) => {
    el.textContent = ''
    const text = grouped ? n.toLocaleString('en-US') : String(n)
    text.split(/(,)/).forEach((part) => {
      if (part === ',') {
        const sep = document.createElement('span')
        sep.className = 'num-sep'
        sep.textContent = ','
        el.append(sep)
      } else if (part) {
        el.append(document.createTextNode(part))
      }
    })
  }

  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.target || '0')
    const grouped = el.dataset.sep === 'true'
    if (reducedMotion()) {
      render(el, target, grouped)
      return
    }
    const duration = 900
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      render(el, Math.round(target * eased), grouped)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => run(el as HTMLElement))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run(entry.target as HTMLElement)
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.6 },
  )
  els.forEach((el) => io.observe(el))
}

// ---- Blur Fade (substitutes Magic UI "Blur Fade") ----
// Entrance-only, once per element: opacity + 4px blur-in. Reduced motion strips
// the blur radius via the CSS rule in styles.css and shows the final state.
export function initBlurFade() {
  const els = document.querySelectorAll<HTMLElement>('.blur-fade')
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 },
  )
  els.forEach((el) => io.observe(el))
}

// ---- Phototab (substitutes SmoothUI "Phototab") ----
// Click-driven tab strip switching the framed image in a PRODUCT gallery.
// Never motion-driven, so there is no reduced-motion fallback to write.
export function initPhototabs() {
  document.querySelectorAll<HTMLElement>('.phototab').forEach((group) => {
    const buttons = group.querySelectorAll<HTMLButtonElement>('.phototab-btn')
    const frame = group.querySelector<HTMLImageElement>('.phototab-img')
    if (!frame) return
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'))
        btn.setAttribute('aria-pressed', 'true')
        frame.src = btn.dataset.src || frame.src
        frame.alt = btn.dataset.alt || frame.alt
      })
    })
  })
}

// ---- GIF poster swap ----
// The looping product-walk GIF has no motion opt-out of its own (ASSET_BOARD
// s4), so the static poster frame ships as the <img src>; swap to the GIF
// only when the viewer has not asked for reduced motion.
export function initGifPoster() {
  if (reducedMotion()) return
  const img = document.getElementById('product-walk-img') as HTMLImageElement | null
  if (!img) return
  const motionSrc = img.dataset.motionSrc
  if (motionSrc) img.src = motionSrc
}

export function initInteractions() {
  initTiltCards()
  initMagneticButton()
  initTextReveal()
  initCountUp()
  initBlurFade()
  initPhototabs()
  initGifPoster()
}
