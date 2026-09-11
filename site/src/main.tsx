import './styles.css'
import { initInteractions } from './interactions.ts'

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

mountMobileNav()
mountCopyEmail()
initInteractions()
