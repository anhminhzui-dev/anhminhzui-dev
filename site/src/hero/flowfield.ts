// flowfield.ts — round 17 hero graphic, ported unchanged in behaviour from
// hero_variants/index.html V3 (head-picked candidate, HEAD_LOOK_2026-09-11.md).
// Own code: a tiny xorshift32 PRNG seeds a 256x256 value-noise grid; bilinear
// sample + a quintic fade curve gives a smooth continuous field. No library,
// no lookup table or code copied from any Perlin/simplex reference.

function makeNoise2D(seed: number): (x: number, y: number) => number {
  let s = seed >>> 0
  function rnd(): number {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
  const SIZE = 256
  const MASK = SIZE - 1
  const grid = new Float32Array(SIZE * SIZE)
  for (let i = 0; i < grid.length; i++) grid[i] = rnd()
  function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
  }
  return function sample(x: number, y: number): number {
    const xi = Math.floor(x) & MASK
    const yi = Math.floor(y) & MASK
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const x1 = (xi + 1) & MASK
    const y1 = (yi + 1) & MASK
    const v00 = grid[yi * SIZE + xi]
    const v10 = grid[yi * SIZE + x1]
    const v01 = grid[y1 * SIZE + xi]
    const v11 = grid[y1 * SIZE + x1]
    const u = fade(xf)
    const v = fade(yf)
    return lerp(lerp(v00, v10, u), lerp(v01, v11, u), v)
  }
}

interface FlowParticle {
  x: number
  y: number
  life: number
}

/** Starts the flow field on `canvas` (sized to its parent element) and
 * returns a stop() function that halts the animation loop and releases the
 * resize/IntersectionObserver listeners. COUNT = 3,000 particles, unchanged
 * from the approved mockup. */
export function init(canvas: HTMLCanvasElement): () => void {
  const ctx2d = canvas.getContext('2d')
  if (!ctx2d) return () => {}
  // Declared (not narrowed) as non-null here so the nested resize/drawFrame
  // closures below — which TS does not carry control-flow narrowing into —
  // see a plain CanvasRenderingContext2D type instead of the nullable one.
  const ctx: CanvasRenderingContext2D = ctx2d

  const DPR = Math.min(window.devicePixelRatio || 1, 2)
  const noise = makeNoise2D(20260911)
  const COUNT = 3000
  let w = 0
  let h = 0
  let particles: FlowParticle[] = []
  let running = false
  let raf = 0

  function resize(): void {
    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    w = rect.width
    h = rect.height
    canvas.width = Math.round(w * DPR)
    canvas.height = Math.round(h * DPR)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  }

  function seed(): void {
    particles = []
    for (let i = 0; i < COUNT; i++) {
      particles.push({ x: Math.random() * w, y: Math.random() * h, life: 100 + Math.random() * 200 })
    }
  }

  function drawFrame(fade: boolean): void {
    ctx.fillStyle = fade ? 'rgba(252,252,251,0.07)' : '#fcfcfb'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(168,70,31,0.2)'
    const scale = 0.006
    const speed = 1.3
    for (const p of particles) {
      const angle = noise(p.x * scale, p.y * scale) * Math.PI * 4
      p.x += Math.cos(angle) * speed
      p.y += Math.sin(angle) * speed
      p.life -= 1
      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || p.life <= 0) {
        p.x = Math.random() * w
        p.y = Math.random() * h
        p.life = 100 + Math.random() * 200
      }
      ctx.fillRect(p.x, p.y, 1.6, 1.6)
    }
  }

  function loop(): void {
    if (!running) return
    drawFrame(true)
    raf = requestAnimationFrame(loop)
  }

  function start(): void {
    if (running) return
    running = true
    loop()
  }

  function stopLoop(): void {
    running = false
    if (raf) cancelAnimationFrame(raf)
  }

  resize()
  seed()

  let reducedMotion = false
  try {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    /* matchMedia unavailable — treat as motion allowed */
  }

  if (reducedMotion) {
    drawFrame(false)
  } else {
    start()
  }

  const onResize = (): void => {
    resize()
    seed()
    if (reducedMotion) drawFrame(false)
  }
  window.addEventListener('resize', onResize)

  let io: IntersectionObserver | null = null
  const frame = canvas.closest('.graphic-frame')
  if (frame && 'IntersectionObserver' in window && !reducedMotion) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start()
          else stopLoop()
        })
      },
      { threshold: 0.05 },
    )
    io.observe(frame)
  }

  return function stop(): void {
    stopLoop()
    window.removeEventListener('resize', onResize)
    if (io) io.disconnect()
  }
}
