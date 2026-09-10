import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

async function mountHero() {
  const mount = document.getElementById('hero-scene')
  const stage = document.getElementById('hero-stage')
  const toggle = document.getElementById('motion-toggle') as HTMLButtonElement | null
  if (!mount || !stage) return
  if (!hasWebGL()) return // static poster + flat mark stay visible, page is fully readable already

  // Code-split the three.js / R3F / shadergradient bundle behind a dynamic
  // import so the static HTML (CV link, case studies, evidence) paints
  // first and never waits on the WebGL scene to download.
  const { default: HeroScene } = await import('./HeroScene.tsx')

  let reduced = prefersReducedMotion()
  const root = createRoot(mount)
  const render = () => {
    root.render(
      <StrictMode>
        <HeroScene reducedMotion={reduced} />
      </StrictMode>,
    )
  }
  render()
  stage.classList.add('scene-live')

  if (toggle) {
    toggle.hidden = false
    toggle.setAttribute('aria-pressed', String(reduced))
    toggle.textContent = reduced ? 'Resume motion' : 'Pause motion'
    toggle.addEventListener('click', () => {
      reduced = !reduced
      toggle.setAttribute('aria-pressed', String(reduced))
      toggle.textContent = reduced ? 'Resume motion' : 'Pause motion'
      render()
    })
  }
}

function mountFlowScrollIn() {
  const flow = document.getElementById('flow-diagram')
  if (!flow) return
  if (prefersReducedMotion()) {
    flow.classList.add('in-view')
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          flow.classList.add('in-view')
          observer.disconnect()
        }
      }
    },
    { threshold: 0.35 },
  )
  observer.observe(flow)
}

// Tilt Card (hand-rolled — Unlumen UI's own terms are a source-available
// licence that restricts redistributing the component itself, not the MIT/
// permissive bar the brief requires before copying source; see the receipt).
// Answers the pointer only: a fine pointer with hover support gets a small
// rotation that tracks the cursor over the card; nothing moves on its own.
function mountTiltCards() {
  if (prefersReducedMotion()) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const cards = document.querySelectorAll<HTMLElement>('.tilt-card')
  cards.forEach((card) => {
    const reset = () => {
      card.style.setProperty('--tilt-x', '0deg')
      card.style.setProperty('--tilt-y', '0deg')
    }
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5
      card.style.setProperty('--tilt-x', `${(-py * 4.5).toFixed(2)}deg`)
      card.style.setProperty('--tilt-y', `${(px * 4.5).toFixed(2)}deg`)
    })
    card.addEventListener('pointerleave', reset)
    reset()
  })
}

// Mobile navigation (round 3, FIX_DIRECTIVES_r3 #9): a 44x44 button opens
// a full-width sheet listing the same links the desktop nav hides at
// 720px. Closes on a link click, on Escape, or on resize back past the
// breakpoint.
function mountMobileNav() {
  const toggle = document.getElementById('nav-toggle') as HTMLButtonElement | null
  const sheet = document.getElementById('nav-sheet')
  if (!toggle || !sheet) return

  const close = () => {
    sheet.hidden = true
    toggle.setAttribute('aria-expanded', 'false')
  }
  const open = () => {
    sheet.hidden = false
    toggle.setAttribute('aria-expanded', 'true')
  }

  toggle.addEventListener('click', () => {
    if (sheet.hidden) open()
    else close()
  })
  sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', close))
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })
  window.matchMedia('(min-width: 721px)').addEventListener('change', (e) => {
    if (e.matches) close()
  })
}

mountHero()
mountFlowScrollIn()
mountTiltCards()
mountMobileNav()
