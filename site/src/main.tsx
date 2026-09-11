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
  if (!hasWebGL()) return // static fallback image stays visible, page is fully readable already

  // Code-split the three.js / R3F bundle behind a dynamic import so the
  // static HTML (CV link, evidence, proof ledger) paints first and never
  // waits on the WebGL scene to download.
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

// Mobile navigation: a 44x44 button opens a full-width sheet listing the
// same links the desktop nav hides at 720px. Closes on a link click, on
// Escape, or on resize back past the breakpoint.
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

// Contact: a working copy-to-clipboard button on the email (DESIGN.md s4,
// rauno.me's own pattern per PRODUCT.md Q5). Falls back to selecting the
// text if the Clipboard API is unavailable or denied, so the control is
// never a dead button.
function mountCopyEmail() {
  const button = document.getElementById('copy-email') as HTMLButtonElement | null
  const emailText = document.getElementById('email-address')
  if (!button || !emailText) return
  const email = emailText.textContent?.trim() ?? ''
  const defaultLabel = button.textContent ?? 'Copy'

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email)
      button.textContent = 'Copied'
    } catch {
      const range = document.createRange()
      range.selectNodeContents(emailText)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      button.textContent = 'Select the address above'
    }
    window.setTimeout(() => {
      button.textContent = defaultLabel
    }, 2000)
  })
}

mountHero()
mountMobileNav()
mountCopyEmail()
