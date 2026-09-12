// interactions.ts — round 16 asset layer (hover/tilt/magnetic, native/hand-rolled,
// MIT-by-construction, zero dependency: Unlumen UI's own catalogue names these
// effects but its licence is not MIT/OFL) plus round 18's Motion-driven moments
// (MOTION_VOCABULARY, BRIEF_r18.md slot 4 / STUDY_r18.md s3): number tickers,
// the résumé's one scroll-entrance stagger, and the product phototab crossfade.
// Every effect here is a no-op (or renders the final state immediately) under
// prefers-reduced-motion, per DESIGN.md and BRIEF_r18.md slot 4.
import { animate, inView, stagger } from 'motion'

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

// ---- Count Up (Motion-powered; MOTION_VOCABULARY "number tickers on the
// four proof cards, 600-900ms, once, ease-out") ----
// data-target holds the final integer; data-sep="," inserts a thousands
// separator rendered in the body face (see styles.css .num-sep note). Also
// drives the two count-up spans in the Product impact line (same mechanism).
export function initCountUp() {
  const els = document.querySelectorAll<HTMLElement>('.count-up')
  const render = (el: HTMLElement, n: number, grouped: boolean) => {
    el.textContent = ''
    const text = grouped ? Math.round(n).toLocaleString('en-US') : String(Math.round(n))
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
    animate(0, target, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (latest) => render(el, latest, grouped),
    })
  }

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => run(el))
    return
  }
  els.forEach((el) => {
    const stop = inView(el, () => {
      run(el)
      stop()
    }, { amount: 0.6 })
  })
}

// ---- Résumé entrance (Motion-powered; MOTION_VOCABULARY "Résumé timeline —
// each role fades/slides in once on scroll, staggered per entry") ----
// This is the section's ONE orchestrated moment (STUDY_r18.md s3) — Product,
// Work and Repos each get their own single moment elsewhere (crossfade /
// hover), so none of them also gets a scroll-entrance fade. No CSS class
// pre-hides these elements: the default state is fully visible, and this
// only overlays a reveal when motion is allowed and IntersectionObserver
// exists, so a no-JS or reduced-motion viewer never sees hidden content.
export function initResumeReveal() {
  const section = document.getElementById('resume')
  if (!section) return
  const items = section.querySelectorAll<HTMLElement>('.resume-preview, .timeline .role')
  if (!items.length || reducedMotion() || !('IntersectionObserver' in window)) return
  items.forEach((el) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(8px)'
  })
  const stop = inView(section, () => {
    animate(
      Array.from(items),
      { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
      { duration: 0.28, ease: 'easeOut', delay: stagger(0.06) },
    )
    stop()
  }, { amount: 0.2 })
}

// ---- Phototab (substitutes SmoothUI "Phototab") ----
// Click-driven tab strip switching the framed image in a PRODUCT gallery.
// Motion powers a short crossfade on the swap (MOTION_VOCABULARY: interactions
// <=200ms, ease-out); under reduced motion the src swaps with no transition.
export function initPhototabs() {
  document.querySelectorAll<HTMLElement>('.phototab').forEach((group) => {
    const buttons = group.querySelectorAll<HTMLButtonElement>('.phototab-btn')
    const frame = group.querySelector<HTMLImageElement>('.phototab-img')
    const fullsize = group.querySelector<HTMLAnchorElement>('#product-fullsize')
    if (!frame) return
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-pressed') === 'true') return
        buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'))
        btn.setAttribute('aria-pressed', 'true')
        const swap = () => {
          frame.src = btn.dataset.src || frame.src
          frame.alt = btn.dataset.alt || frame.alt
          if (fullsize) fullsize.href = frame.src
        }
        if (reducedMotion()) {
          swap()
          return
        }
        animate(frame, { opacity: [1, 0] }, { duration: 0.09, ease: 'easeOut' }).then(() => {
          swap()
          animate(frame, { opacity: [0, 1] }, { duration: 0.09, ease: 'easeOut' })
        })
      })
    })
  })
}

export function initInteractions() {
  initTiltCards()
  initMagneticButton()
  initCountUp()
  initResumeReveal()
  initPhototabs()
}
