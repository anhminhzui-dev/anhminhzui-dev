import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import Particles from './Particles.tsx'

type HeroSceneProps = {
  reducedMotion: boolean
}

// Round 6 (Founder ruling, amendment A, 2026-09-10 15:44): the organic
// element now comes from the stack's own libraries rather than a hand-built
// scene — the ginkgo survives only as the small nav-mark SVG (unchanged,
// see index.html's .brand-mark). This replaces the round-2..5 hand-authored
// vein/margin geometry (GinkgoLeaf, deleted whole) with:
//   1. @shadergradient/react's own R3F canvas, a slow `plane` mesh tuned
//      to three neighbouring warm paper tones (`#F0EEE6` -> `#E4E0D2`)
//      plus one muted-ochre glint as the third gradient stop — never the
//      page's own `--accent` (`#4F6B3F`); this is a separate, deliberately
//      subdued background device the founder authorized by name, not a
//      third accent-discipline location. `type="waterPlane"` was tried
//      first (the founder's other named option) and rejected: its
//      reflection/HDRI pass read our pale colours against the `city`
//      environment map and blew the whole plane out to a white/cyan wash,
//      not a paper tint — a live, screenshotted finding, not a guess.
//      The library's OWN `grain` post-process was tried too and rejected
//      for the same reason: calibrated for the library's usual saturated
//      presets, it additively brightens, and against colours already at
//      ~92% luminance it blows the plane to solid white (screenshotted).
//      `grain` stays "off" here; the founder's "grain on" requirement is
//      met instead by (2), which is legible at this luminance.
//   2. A second, local noise-texture layer at 5% opacity (`.hero-grain`),
//      independent of the page's global `.noise-overlay` — that overlay
//      sits in a lower stacking context than `.hero` (z-index 0 vs 1) and
//      is fully occluded by the gradient's own opaque canvas pixels, so a
//      dedicated layer is the only way the grain actually reads as sitting
//      "over" the gradient rather than uselessly underneath it.
//   3. Magic UI's Particles (MIT), hand-rolled in `Particles.tsx` per the
//      same house rule already used for Noise Texture — 14 points, muted
//      `#5E5D59`, drifting slower than is consciously visible.
function GradientHero({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0 }}
        pointerEvents="none"
        pixelDensity={1}
      >
        <ShaderGradient
          type="plane"
          animate={reducedMotion ? 'off' : 'on'}
          uTime={0}
          uSpeed={0.12}
          uStrength={2.4}
          uDensity={1.5}
          uFrequency={5.5}
          uAmplitude={1.2}
          color1="#EFEBDF"
          color2="#D9CFB6"
          color3="#B08A55"
          reflection={0}
          brightness={1.12}
          cAzimuthAngle={180}
          cPolarAngle={95}
          cDistance={2.4}
          cameraZoom={1}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={0}
          rotationZ={0}
          lightType="3d"
          envPreset="city"
          grain="off"
          grainBlending={0.08}
          wireframe={false}
        />
      </ShaderGradientCanvas>
      <div className="hero-grain" aria-hidden="true" />
      <Particles reducedMotion={reducedMotion} />
    </>
  )
}

export default function HeroScene({ reducedMotion }: HeroSceneProps) {
  return <GradientHero reducedMotion={reducedMotion} />
}
