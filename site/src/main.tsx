import './styles.css'
import { animate, scroll } from 'motion'
import { initInteractions } from './interactions.ts'
import { init as initFlowField } from './hero/flowfield.ts'

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
    if (e.key === 'Escape' && !sheet.hidden) { close(); toggle.focus() }
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

// Continuous motion is opt-in; one native control stops both loops.
function mountLoopingMotion() {
  const button = document.getElementById('motion-toggle') as HTMLButtonElement | null
  const canvas = document.getElementById('flow-canvas') as HTMLCanvasElement | null
  const fallback = document.querySelector<HTMLImageElement>('.graphic-fallback')
  const walkthrough = document.getElementById('product-walk-img') as HTMLImageElement | null
  if (!button || !canvas || !fallback || !walkthrough) return
  const poster = walkthrough.src
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const narrow = window.matchMedia('(max-width: 479px)')
  let playing = false
  let stopField: (() => void) | undefined
  const update = () => {
    stopField?.()
    stopField = undefined
    if (reduced.matches) playing = false
    canvas.hidden = true
    fallback.hidden = false
    walkthrough.src = playing ? (walkthrough.dataset.motionSrc || poster) : poster
    if (playing && !narrow.matches && canvas.getContext('2d')) {
      canvas.hidden = false
      fallback.hidden = true
      stopField = initFlowField(canvas)
    }
    button.hidden = reduced.matches
    button.textContent = playing ? 'Stop animations' : 'Play animations'
  }
  button.addEventListener('click', () => { playing = !playing; update() })
  reduced.addEventListener('change', update)
  narrow.addEventListener('change', update)
  update()
}

// Hero graphic frame: the one device-frame parallax named in STUDY_r18.md s3
// ("a small 4-8px scroll-linked parallax on the first viewport only, once,
// never re-triggering"). Motion's scroll() ties the transform directly to
// scroll position across the hero's own height, so it never re-triggers —
// it just is the scroll position, not a repeating loop.
function mountHeroParallax() {
  const frame = document.querySelector<HTMLElement>('.hero .graphic-frame')
  const hero = document.querySelector<HTMLElement>('.hero')
  if (!frame || !hero) return
  let reducedMotion = false
  try {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    /* matchMedia unavailable — treat as motion allowed */
  }
  if (reducedMotion) return
  scroll(animate(frame, { transform: ['translateY(0px)', 'translateY(-6px)'] }), {
    target: hero,
    offset: ['start start', 'end start'],
  })
}

mountMobileNav()
mountCopyEmail()
mountLoopingMotion()
mountHeroParallax()
initInteractions()
