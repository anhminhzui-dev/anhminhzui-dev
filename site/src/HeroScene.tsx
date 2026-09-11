import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'

type HeroSceneProps = {
  reducedMotion: boolean
}

// DESIGN.md s5: "the existing fan-leaf geometry is fine" (restored from
// commit 0ce0e6c, pre-shadergradient) rendered as a single soft organic
// form in the accent hue at low saturation, matte material, no
// transmission. The vein/margin math below is unchanged from that
// commit — only the two materials' colour and opacity, and the settle
// timing, changed to match DESIGN.md s1 (accent, ONLY at 12% opacity,
// for the organic element) and s5 (one load settle, <=1.5s).
const BASE: [number, number] = [0, -1.55] // convergence point (fan meets petiole)
const R = 2.0 // margin radius
const HALF_ANGLE = 60 // a true 120deg fan
const N_VEINS = 13
const CENTER_INDEX = (N_VEINS - 1) / 2 // vein 6 of 0..12 sits at angle 0
const NOTCH_R = R * 0.82 // the centre vein stops short here, reading as the apex notch
const FORK_FRAC = 0.6
const WIDTH_BASE = 0.024
const WIDTH_MARGIN = 0.012
const PETIOLE_LEN = 1.35
const PETIOLE_WIDTH_START = 0.026
const PETIOLE_WIDTH_END = 0.013
const ACCENT = '#A8461F' // DESIGN.md --accent; the only hue in this scene

function polar(angleDeg: number, radius: number): THREE.Vector3 {
  const a = (angleDeg * Math.PI) / 180
  return new THREE.Vector3(BASE[0] + radius * Math.sin(a), BASE[1] + radius * Math.cos(a), 0)
}

// Deterministic pseudo-random in [-1, 1], seeded by index — reproducible
// hand-drawn irregularity, never recomputed per frame, never animated.
function seeded(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

function quadPoint(p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, t: number): THREE.Vector3 {
  const a = (1 - t) * (1 - t)
  const b = 2 * (1 - t) * t
  const c = t * t
  return new THREE.Vector3(
    a * p0.x + b * p1.x + c * p2.x,
    a * p0.y + b * p1.y + c * p2.y,
    a * p0.z + b * p1.z + c * p2.z,
  )
}

function sampleQuad(p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, steps: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= steps; i++) pts.push(quadPoint(p0, p1, p2, i / steps))
  return pts
}

/** A flat tapered ribbon (triangle strip) along a polyline — a real,
 * always-visible mesh rather than a WebGL line-width extension. */
function buildRibbon(points: THREE.Vector3[], widths: number[]): THREE.BufferGeometry {
  const positions: number[] = []
  const normals: number[] = []
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const prev = points[Math.max(0, i - 1)]
    const next = points[Math.min(points.length - 1, i + 1)]
    const dir = next.clone().sub(prev)
    if (dir.lengthSq() === 0) dir.set(1, 0, 0)
    dir.normalize()
    const perp = new THREE.Vector3(-dir.y, dir.x, 0)
    const w = widths[i] / 2
    const a = p.clone().addScaledVector(perp, w)
    const b = p.clone().addScaledVector(perp, -w)
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
    normals.push(0, 0, 1, 0, 0, 1)
  }
  const indices: number[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = i * 2
    const b = i * 2 + 1
    const c = i * 2 + 2
    const d = i * 2 + 3
    indices.push(a, b, c, b, d, c)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setIndex(indices)
  return geo
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function veinAngle(i: number): number {
  const base = -HALF_ANGLE + i * ((2 * HALF_ANGLE) / (N_VEINS - 1))
  return base + seeded(i) * 1
}

function veinRadius(i: number): number {
  return i === CENTER_INDEX ? NOTCH_R : R
}

type MarginSeg = { p0: THREE.Vector3; control: THREE.Vector3; p2: THREE.Vector3 }

function buildMarginSegments(): MarginSeg[] {
  const segs: MarginSeg[] = []
  for (let i = 0; i < N_VEINS - 1; i++) {
    const a0 = veinAngle(i)
    const a1 = veinAngle(i + 1)
    const p0 = polar(a0, veinRadius(i))
    const p2 = polar(a1, veinRadius(i + 1))
    const midAngle = (a0 + a1) / 2
    const baseDip = 0.11
    const dip = baseDip + seeded(i + 50) * 0.035
    const control = polar(midAngle, R - dip)
    segs.push({ p0, control, p2 })
  }
  return segs
}

function marginPointsFromSegments(segs: MarginSeg[]): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  segs.forEach((s, i) => {
    const sampled = sampleQuad(s.p0, s.control, s.p2, 8)
    pts.push(...(i === 0 ? sampled : sampled.slice(1)))
  })
  return pts
}

type Vein = { trunk: THREE.Vector3[]; branchA: THREE.Vector3[]; branchB: THREE.Vector3[] }

function buildVeins(): Vein[] {
  const veins: Vein[] = []
  const base = polar(0, 0.02)
  for (let i = 0; i < N_VEINS; i++) {
    const angle = -HALF_ANGLE + i * ((2 * HALF_ANGLE) / (N_VEINS - 1))
    const forkPoint = polar(angle, veinRadius(i) * FORK_FRAC)
    const trunkDir = forkPoint.clone().sub(base).normalize()

    const peak = polar(veinAngle(i), veinRadius(i))
    const branchAControl = forkPoint.clone().addScaledVector(trunkDir, 0.08 * R).lerp(peak, 0.3)
    const branchA = sampleQuad(forkPoint, branchAControl, peak, 5)

    const nextIndex = Math.min(i + 1, N_VEINS - 1)
    const midAngle = (veinAngle(i) + veinAngle(nextIndex)) / 2
    const dipPoint = polar(midAngle, R - 0.11)
    const branchBControl = forkPoint.clone().addScaledVector(trunkDir, 0.15 * R)
    const branchB = sampleQuad(forkPoint, branchBControl, dipPoint, 5)

    veins.push({ trunk: [base, forkPoint], branchA, branchB })
  }
  return veins
}

function widthsFor(points: THREE.Vector3[], wStart: number, wEnd: number): number[] {
  return points.map((_, i) => lerp(wStart, wEnd, i / (points.length - 1)))
}

/** A small triangle-fan disc — the petiole's rounded terminal. */
function buildDisc(center: THREE.Vector3, radius: number, segments = 10): THREE.BufferGeometry {
  const positions: number[] = [center.x, center.y, center.z]
  const normals: number[] = [0, 0, 1]
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    positions.push(center.x + Math.cos(a) * radius, center.y + Math.sin(a) * radius, center.z)
    normals.push(0, 0, 1)
  }
  const indices: number[] = []
  for (let i = 1; i <= segments; i++) indices.push(0, i, i + 1)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setIndex(indices)
  return geo
}

// DESIGN.md s5: "One load settle (<=1.5s, ease-out), then it answers the
// pointer only." (was 2s pre-rebuild)
const SETTLE_SECONDS = 1.4

function GinkgoLeaf({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const elapsed = useRef(0)
  const restRotation = { x: THREE.MathUtils.degToRad(-6), y: 0, z: 0.01 }

  const fillGeometry = useMemo(() => {
    const marginPts = marginPointsFromSegments(buildMarginSegments())
    const shape = new THREE.Shape(marginPts.map((p) => new THREE.Vector2(p.x, p.y)))
    shape.lineTo(BASE[0], BASE[1])
    return new THREE.ShapeGeometry(shape)
  }, [])

  const strokeMeshes = useMemo(() => {
    const meshes: THREE.Mesh[] = []
    // DESIGN.md s1: accent lives here at 12% opacity, matte
    // MeshBasicMaterial (no lighting dependency, no transmission) — the
    // one non-button, non-number place the accent is allowed.
    const strokeMat = new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    })

    for (const seg of buildMarginSegments()) {
      const pts = sampleQuad(seg.p0, seg.control, seg.p2, 8)
      meshes.push(new THREE.Mesh(buildRibbon(pts, pts.map(() => WIDTH_MARGIN)), strokeMat))
    }

    for (const vein of buildVeins()) {
      const midW = (WIDTH_BASE + WIDTH_MARGIN) / 2
      meshes.push(new THREE.Mesh(buildRibbon(vein.trunk, [WIDTH_BASE, midW]), strokeMat))
      meshes.push(new THREE.Mesh(buildRibbon(vein.branchA, widthsFor(vein.branchA, midW, WIDTH_MARGIN)), strokeMat))
      meshes.push(new THREE.Mesh(buildRibbon(vein.branchB, widthsFor(vein.branchB, midW, WIDTH_MARGIN)), strokeMat))
    }

    const petioleStart = polar(0, 0.02)
    const petioleTip = new THREE.Vector3(BASE[0], BASE[1] - PETIOLE_LEN, 0)
    const petioleControl = new THREE.Vector3(BASE[0] + 0.06, BASE[1] - PETIOLE_LEN * 0.55, 0)
    const petiolePts = sampleQuad(petioleStart, petioleControl, petioleTip, 10)
    meshes.push(
      new THREE.Mesh(
        buildRibbon(petiolePts, widthsFor(petiolePts, PETIOLE_WIDTH_START, PETIOLE_WIDTH_END)),
        strokeMat,
      ),
    )
    meshes.push(new THREE.Mesh(buildDisc(petioleTip, PETIOLE_WIDTH_END / 2), strokeMat))

    return meshes
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return
    if (reducedMotion) {
      group.current.rotation.set(restRotation.x, restRotation.y, restRotation.z)
      return
    }
    elapsed.current = Math.min(elapsed.current + delta, SETTLE_SECONDS + 1)
    const t = Math.min(elapsed.current / SETTLE_SECONDS, 1)
    const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic, once — never loops

    const startY = restRotation.y - 0.5
    const startX = restRotation.x - 0.18
    const settledY = THREE.MathUtils.lerp(startY, restRotation.y, eased)
    const settledX = THREE.MathUtils.lerp(startX, restRotation.x, eased)

    // Answers the pointer only, <=3deg, once settled.
    const maxDrift = THREE.MathUtils.degToRad(3)
    const px = state.pointer.x
    const py = state.pointer.y
    const driftAmount = eased
    const targetY = settledY + px * maxDrift * driftAmount
    const targetX = settledX + py * maxDrift * 0.6 * driftAmount

    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.06)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.06)
    group.current.rotation.z = restRotation.z
  })

  return (
    <group ref={group} scale={1}>
      {/* Faint fill so the fan reads as a paper-thin plane, not a wire
          skeleton — accent at the same 12% opacity as the strokes, the
          scene's single hue. */}
      <mesh geometry={fillGeometry}>
        <meshBasicMaterial color={ACCENT} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      {strokeMeshes.map((mesh, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </group>
  )
}

export default function HeroScene({ reducedMotion }: HeroSceneProps) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0 }}
      camera={{ position: [0, 0, 5.2], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.8]}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <GinkgoLeaf reducedMotion={reducedMotion} />
    </Canvas>
  )
}
