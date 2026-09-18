import { calculateConcurrency } from './concurrency-math';
import { vertexShader, fragmentShader } from './threads-shaders';

/** React Bits' original Threads shader, with small native WebGL lifecycle plumbing. */
export function initConcurrencyExplorer() {
  const canvas = document.querySelector<HTMLCanvasElement>('#threads-canvas');
  if (!canvas) return;
  const rate = document.querySelector<HTMLInputElement>('#request-rate')!;
  const time = document.querySelector<HTMLInputElement>('#response-time')!;
  const result = document.querySelector<HTMLOutputElement>('#concurrency-result')!;
  const equation = document.querySelector<HTMLElement>('#concurrency-equation')!;
  const error = document.querySelector<HTMLElement>('#concurrency-error')!;
  const status = document.querySelector<HTMLElement>('#threads-status')!;
  const motion = document.querySelector<HTMLButtonElement>('#threads-motion')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const format = (n: number) => n.toLocaleString('en-US', { maximumSignificantDigits: 6 });
  let load = 5, valid = true, gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null;
  let frame = 0, rendered = 0, elapsed = 0, last = 0, userPaused = false;
  let onScreen = false, disposed = false, lost = false;
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const shaders: WebGLShader[] = [];
  const runnable = () => !!gl && !lost && !disposed && valid && onScreen && !document.hidden && !userPaused && !reduced.matches;
  function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; last = 0; }
  function draw() {
    if (!gl || lost || disposed || !program) return;
    // Preserve upstream Threads geometry; load changes rhythm only.
    gl.uniform1f(uniforms.uAmplitude, 1);
    gl.uniform1f(uniforms.uDistance, 0);
    gl.uniform1f(uniforms.iTime, elapsed);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // Observable runtime state, also useful when inspecting lifecycle failures.
    canvas!.dataset.frames = String(++rendered);
    canvas!.dataset.load = String(load);
  }
  function tick(now: number) {
    frame = 0;
    if (!runnable()) return;
    if (!last || now - last >= 1000 / 30) {
      if (last) elapsed += Math.min(now - last, 100) / 1000 * (0.5 + load / (load + 5));
      last = now; draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    stop();
    const available = !!gl && !lost;
    motion.hidden = !available;
    motion.disabled = reduced.matches;
    motion.textContent = reduced.matches ? 'Animation paused' : userPaused ? 'Resume animation' : 'Pause animation';
    status.textContent = !available ? 'Animation unavailable. The calculator still works.' : reduced.matches ? 'Static view · reduced motion' : '';
    canvas!.hidden = !valid || !available;
    canvas!.dataset.state = !available ? 'unavailable' : !valid ? 'invalid' : !onScreen || document.hidden ? 'suspended' : userPaused || reduced.matches ? 'paused' : 'running';
    if (available && valid && onScreen && !document.hidden) draw();
    if (runnable()) frame = requestAnimationFrame(tick);
  }
  function update() {
    const answer = calculateConcurrency(rate.value, time.value);
    valid = answer.ok;
    error.hidden = answer.ok;
    if (!answer.ok) {
      rate.setAttribute('aria-invalid', String(!answer.rateValid));
      time.setAttribute('aria-invalid', String(!answer.timeValid));
      result.value = '—'; equation.textContent = 'Enter valid averages to calculate.';
      error.textContent = answer.error;
    } else {
      rate.removeAttribute('aria-invalid'); time.removeAttribute('aria-invalid');
      error.textContent = ''; load = answer.average;
      result.value = format(load);
      equation.textContent = `L = λ × W = ${format(answer.rate)} requests/s × ${format(answer.seconds)} s = ${format(load)}`;
    }
    sync();
  }
  function resize() {
    if (!gl || lost) return;
    const box = canvas!.parentElement!.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5, 1600 / Math.max(box.width, box.height));
    canvas!.width = Math.max(1, Math.round(box.width * dpr));
    canvas!.height = Math.max(1, Math.round(box.height * dpr));
    gl.viewport(0, 0, canvas!.width, canvas!.height);
    gl.uniform3f(uniforms.iResolution, canvas!.width, canvas!.height, canvas!.width / canvas!.height);
    if (valid && onScreen && !document.hidden) draw();
  }
  const intersection = new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; sync(); });
  const size = new ResizeObserver(resize);
  function releaseGPU() {
    if (!gl) return;
    shaders.forEach(shader => gl!.deleteShader(shader));
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    program = null; buffer = null;
  }
  try {
    gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) throw new Error('WebGL unavailable');
    const compile = (source: string, kind: number) => {
      const shader = gl!.createShader(kind);
      if (!shader) throw new Error('Shader allocation failed');
      shaders.push(shader); gl!.shaderSource(shader, source); gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || 'Shader compilation failed');
      return shader;
    };
    program = gl.createProgram();
    if (!program) throw new Error('Program allocation failed');
    gl.attachShader(program, compile(vertexShader, gl.VERTEX_SHADER));
    gl.attachShader(program, compile(fragmentShader, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader link failed');
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error('Buffer allocation failed');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    for (const name of ['iTime', 'iResolution', 'uColor', 'uAmplitude', 'uDistance', 'uMouse']) uniforms[name] = gl.getUniformLocation(program, name);
    gl.uniform3f(uniforms.uColor, 0.11, 0.105, 0.098); gl.uniform2f(uniforms.uMouse, 0.5, 0.5);
    gl.clearColor(0, 0, 0, 0); resize();
  } catch {
    releaseGPU(); gl = null;
  }
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; sync(); });
  // A lost context falls back to useful math until reload; never silently animate stale GPU state.
  document.querySelector<HTMLFieldSetElement>('#concurrency-inputs')!.disabled = false;
  document.querySelector('#concurrency-form')!.addEventListener('submit', event => event.preventDefault());
  rate.addEventListener('input', update); time.addEventListener('input', update);
  motion.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  intersection.observe(canvas.parentElement!); size.observe(canvas.parentElement!);
  window.addEventListener('pagehide', event => {
    if (event.persisted) { stop(); return; }
    disposed = true; stop(); intersection.disconnect(); size.disconnect(); releaseGPU();
    document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync);
  });
  // History restoration may restore input values after pageshow without an input event.
  const restoreInputs = () => { setTimeout(() => { if (!disposed) update(); }, 0); };
  window.addEventListener('pageshow', restoreInputs);
  window.addEventListener('popstate', restoreInputs);
  update();
}
