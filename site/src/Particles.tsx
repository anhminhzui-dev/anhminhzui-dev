import { useEffect, useRef } from 'react'

// Particles (hand-rolled — Magic UI's own component, MIT, verified via its
// GitHub LICENSE.md, is a plain 2D-canvas dot field; reproduced here rather
// than pulled as a dependency for a forty-line effect, the same call already
// made for Noise Texture in styles.css). Round 6, founder ruling (A): very
// sparse, muted `#5E5D59`, quiet by construction — a dozen soft points
// drifting upward slower than the eye tracks, never a foreground effect.
const COUNT = 14
const COLOR = '94, 93, 89' // #5E5D59 as an rgb triple, for canvas rgba()

type Particle = { x: number; y: number; r: number; a: number; speed: number }

function seeded(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function makeParticles(): Particle[] {
  const pts: Particle[] = []
  for (let i = 0; i < COUNT; i++) {
    pts.push({
      x: seeded(i * 2 + 1),
      y: seeded(i * 2 + 2),
      r: 1 + seeded(i * 3 + 5) * 1.4,
      a: 0.12 + seeded(i * 5 + 7) * 0.16,
      speed: 0.006 + seeded(i * 7 + 11) * 0.008,
    })
  }
  return pts
}

export default function Particles({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>(makeParticles())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      width = rect?.width ?? canvas.clientWidth
      height = rect?.height ?? canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles.current) {
        ctx.beginPath()
        ctx.fillStyle = `rgba(${COLOR}, ${p.a})`
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (reducedMotion) {
      draw()
      return () => window.removeEventListener('resize', resize)
    }

    const tick = () => {
      for (const p of particles.current) {
        p.y -= p.speed * 0.016
        if (p.y < -0.05) p.y = 1.05
      }
      draw()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} className="hero-particles" aria-hidden="true" />
}
