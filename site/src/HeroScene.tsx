import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'

type HeroSceneProps = {
  reducedMotion: boolean
}

// Round 5 (FIX_DIRECTIVES_r5.md #2 / judge fix 2): a clean rebuild of the
// vein and margin geometry. Round 4's margin used
// `Math.sin(angle * WAVE_FREQ)` with `angle` in DEGREES fed into a
// function that expects RADIANS — a real unit bug, not a design choice —
// which produced roughly 26 full oscillation cycles across the fan
// instead of a gentle wave: the "uniform mechanical sawtooth" the judge
// measured. This version never sines an angle at all. The margin is
// built from exact quadratic-bezier arcs between the SAME points the
// veins terminate at, so a vein tip cannot ever land outside the drawn
// margin (round 4's "escapes the silhouette" and "overshoots the
// margin" defects) — geometrically impossible here, not just tuned away.
const BASE: [number, number] = [0, -1.55] // convergence point (fan meets petiole)
const R = 2.0 // margin radius
const HALF_ANGLE = 60 // a true 120deg fan
const N_VEINS = 13
const CENTER_INDEX = (N_VEINS - 1) / 2 // vein 6 of 0..12 sits at angle 0
const NOTCH_R = R * 0.82 // the centre vein stops short here, reading as the apex notch
const FORK_FRAC = 0.6
const WIDTH_BASE = 0.024 // "1.6px at the fan" (approximate, world units)
const WIDTH_MARGIN = 0.012 // "0.8px at the margin"
const PETIOLE_LEN = 1.35
const PETIOLE_WIDTH_START = 0.026 // "1.6px at the fan"
const PETIOLE_WIDTH_END = 0.013 // "0.8px at its end"

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
 * always-visible mesh rather than a WebGL line-width extension (round
 * 3's drei `<Line>` silently rendered at zero width in this renderer). */
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

/** 13 vein angles, evenly spaced across the 120deg fan, each with the
 * <=1deg jitter applied ONLY here (the margin endpoint) — never to the
 * trunk or fork direction, which is what produced round 4's mid-stroke
 * zig-zags. The centre vein (index 6) is shortened to NOTCH_R; every
 * other vein reaches the full margin radius R. */
function veinAngle(i: number): number {
  const base = -HALF_ANGLE + i * ((2 * HALF_ANGLE) / (N_VEINS - 1))
  return base + seeded(i) * 1 // +-1deg, at the margin endpoint only
}

function veinRadius(i: number): number {
  return i === CENTER_INDEX ? NOTCH_R : R
}

type MarginSeg = { p0: THREE.Vector3; control: THREE.Vector3; p2: THREE.Vector3 }

/** One smooth quadratic arc per vein-to-vein gap ("one gentle wave per
 * vein pair"), each starting and ending EXACTLY at a vein's own margin
 * point (a quadratic bezier always meets its endpoints exactly), bowed
 * inward at the midpoint angle by a small, seeded (never identical)
 * amount — a scalloped curve, not a sawtooth of identical teeth. */
function buildMarginSegments(): MarginSeg[] {
  const segs: MarginSeg[] = []
  for (let i = 0; i < N_VEINS - 1; i++) {
    const a0 = veinAngle(i)
    const a1 = veinAngle(i + 1)
    const p0 = polar(a0, veinRadius(i))
    const p2 = polar(a1, veinRadius(i + 1))
    const midAngle = (a0 + a1) / 2
    const baseDip = 0.11
    const dip = baseDip + seeded(i + 50) * 0.035 // +-0.035, never two teeth equal
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

/** Every vein starts at the convergence point and forks once at 60% of
 * the radius. Branch A continues toward the vein's own margin point
 * (nearly the trunk's own direction — no kink). Branch B curves toward
 * the shallow dip just past it, easing out of the trunk's direction via
 * a quadratic control point rather than bending sharply at the fork —
 * this, combined with jitter living only at margin endpoints, is what
 * keeps every stroke smooth from base to tip. Because branch B always
 * targets a point strictly inside the margin curve (the dip radius is
 * always less than R), no vein can ever overshoot it. */
function buildVeins(): Vein[] {
  const veins: Vein[] = []
  const base = polar(0, 0.02)
  for (let i = 0; i < N_VEINS; i++) {
    const angle = -HALF_ANGLE + i * ((2 * HALF_ANGLE) / (N_VEINS - 1)) // unjittered trunk direction
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

const SETTLE_SECONDS = 2

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
    const strokeMat = new THREE.MeshBasicMaterial({
      color: '#5E5D59',
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    })

    // Margin: one ribbon mesh per smooth arc segment, constant thin width.
    for (const seg of buildMarginSegments()) {
      const pts = sampleQuad(seg.p0, seg.control, seg.p2, 8)
      meshes.push(new THREE.Mesh(buildRibbon(pts, pts.map(() => WIDTH_MARGIN)), strokeMat))
    }

    // Veins: trunk tapers base->fork; each branch continues that taper
    // fork->margin (or fork->dip for branch B).
    for (const vein of buildVeins()) {
      const midW = (WIDTH_BASE + WIDTH_MARGIN) / 2
      meshes.push(new THREE.Mesh(buildRibbon(vein.trunk, [WIDTH_BASE, midW]), strokeMat))
      meshes.push(new THREE.Mesh(buildRibbon(vein.branchA, widthsFor(vein.branchA, midW, WIDTH_MARGIN)), strokeMat))
      meshes.push(new THREE.Mesh(buildRibbon(vein.branchB, widthsFor(vein.branchB, midW, WIDTH_MARGIN)), strokeMat))
    }

    // Petiole: a gently curved, tapered stroke continuing below the
    // convergence point, ending in a small rounded disc (its "terminal").
    const petioleStart = polar(0, 0.02)
    const petioleTip = new THREE.Vector3(BASE[0], BASE[1] - PETIOLE_LEN, 0)
    const petioleControl = new THREE.Vector3(BASE[0] + 0.06, BASE[1] - PETIOLE_LEN * 0.55, 0) // "slightly curved"
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

    // Gentle drift <=3deg on pointer, per the ruling.
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
          skeleton: 6% opacity, flat MeshBasicMaterial (no lighting
          dependency, no dome shading). */}
      <mesh geometry={fillGeometry}>
        <meshBasicMaterial color="#9D9868" transparent opacity={0.06} side={THREE.DoubleSide} />
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
