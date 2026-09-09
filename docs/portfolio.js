// Optional visual layer: the complete portfolio remains ordinary HTML without it.
const signature = document.querySelector('.signature');
const target = document.querySelector('#metal-signature');
const toggle = document.querySelector('#motion-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let shader;
let paused = reduced.matches;
const pointerEnabled = matchMedia('(hover: hover) and (pointer: fine)').matches;

function syncMotion() {
  shader?.setSpeed(paused ? 0 : 0.22);
  toggle.textContent = paused ? 'Play motion' : 'Pause motion';
  toggle.setAttribute('aria-pressed', String(paused));
  signature.dataset.motion = paused ? 'paused' : 'playing';
}
toggle.addEventListener('click', () => { paused = !paused; syncMotion(); });
reduced.addEventListener('change', () => { paused = reduced.matches; syncMotion(); });

async function initSignature() {
  let processedUrl;
  try {
    const [{ ShaderMount }, { liquidMetalFragmentShader, toProcessedLiquidMetal }] = await Promise.all([
      import('./assets/paper/shader-mount.js'),
      import('./assets/paper/shaders/liquid-metal.js'),
    ]);
    // Rasterize the licensed SVG at a bounded size before Paper's preprocessing.
    // Direct SVG preprocessing otherwise allocates a 4096px texture upstream.
    const botanical = new Image();
    botanical.src = 'assets/ginkgo.svg';
    await botanical.decode();
    const mask = document.createElement('canvas');
    mask.width = 520; mask.height = 520;
    const context = mask.getContext('2d');
    if (!context) throw new Error('No 2D context');
    context.drawImage(botanical, 30, 30, 460, 460);
    const { pngBlob } = await toProcessedLiquidMetal(mask.toDataURL());
    processedUrl = URL.createObjectURL(pngBlob);
    const image = new Image(); image.src = processedUrl; await image.decode();
    shader = new ShaderMount(target, liquidMetalFragmentShader, {
      u_image: image, u_isImage: true, u_shape: 0,
      u_colorBack: [0, 0, 0, 0], u_colorTint: [0.92, 0.96, 0.89, 1],
      u_repetition: 2, u_softness: 0.16, u_distortion: 0.13, u_contour: 0.42,
      u_shiftRed: 0.035, u_shiftBlue: 0.035, u_angle: 55,
      u_scale: 1.05, u_fit: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0,
      u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
    }, { alpha: true, antialias: false, powerPreference: 'low-power' }, 0, 6200, 1, 600000);
    shader.canvasElement.setAttribute('aria-hidden', 'true');
    shader.canvasElement.addEventListener('webglcontextlost', () => {
      shader.dispose(); shader = undefined;
      target.replaceChildren(); signature.dataset.graphics = 'static'; toggle.hidden = true;
    });
    signature.dataset.graphics = 'ready';
    toggle.hidden = false; syncMotion();
    signature.addEventListener('pointermove', event => {
      if (paused || !pointerEnabled || !shader) return;
      const box = signature.getBoundingClientRect();
      shader.setUniforms({ u_angle: 45 + 24 * ((event.clientX - box.left) / box.width) });
    });
    signature.addEventListener('pointerleave', () => { if (!paused) shader?.setUniforms({ u_angle: 55 }); });
  } catch (error) {
    shader?.dispose(); shader = undefined; target.replaceChildren();
    signature.dataset.graphics = 'static'; toggle.hidden = true;
    console.warn('Signature enhancement unavailable; static identity retained.', error);
  } finally { if (processedUrl) URL.revokeObjectURL(processedUrl); }
}
// ShaderMount already pauses offscreen and in hidden tabs; no second animation loop.
initSignature();
