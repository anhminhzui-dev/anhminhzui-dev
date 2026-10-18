(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e,t){let n=Number(e),r=Number(t),i=e.trim()!==``&&Number.isFinite(n)&&n>=0&&n<=1e5,a=t.trim()!==``&&Number.isFinite(r)&&r>=0&&r<=6e5;return!i||!a?{ok:!1,rateValid:i,timeValid:a,error:i?`Enter response time from 0 to 600,000 milliseconds.`:`Enter throughput from 0 to 100,000 requests per second.`}:{ok:!0,rate:n,seconds:r/1e3,average:n*r/1e3}}var t=`
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`,n=`
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;function r(){let r=document.querySelector(`#threads-canvas`);if(!r)return;let i=document.querySelector(`#request-rate`),a=document.querySelector(`#response-time`),o=document.querySelector(`#concurrency-result`),s=document.querySelector(`#concurrency-equation`),c=document.querySelector(`#concurrency-error`),l=document.querySelector(`#threads-status`),u=document.querySelector(`#threads-motion`),d=matchMedia(`(prefers-reduced-motion: reduce)`),f=e=>e.toLocaleString(`en-US`,{maximumSignificantDigits:6}),p=5,m=!0,h=null,g=null,_=null,v=0,y=0,b=0,x=0,S=!1,C=!1,w=!1,T=!1,E={},D=[],O=()=>!!h&&!T&&!w&&m&&C&&!document.hidden&&!S&&!d.matches;function k(){v&&cancelAnimationFrame(v),v=0,x=0}function A(){h&&!T&&!w&&g&&(h.uniform1f(E.uAmplitude,1),h.uniform1f(E.uDistance,0),h.uniform1f(E.iTime,b),h.clear(h.COLOR_BUFFER_BIT),h.drawArrays(h.TRIANGLES,0,3),r.dataset.frames=String(++y),r.dataset.load=String(p))}function j(e){v=0,O()&&((!x||e-x>=1e3/30)&&(x&&(b+=Math.min(e-x,100)/1e3*(.5+p/(p+5))),x=e,A()),v=requestAnimationFrame(j))}function M(){k();let e=!!h&&!T;u.hidden=!e,u.disabled=d.matches,u.textContent=d.matches?`Animation paused`:S?`Resume animation`:`Pause animation`,l.textContent=e?d.matches?`Static view · reduced motion`:``:`Animation unavailable. The calculator still works.`,r.hidden=!m||!e,r.dataset.state=e?m?!C||document.hidden?`suspended`:S||d.matches?`paused`:`running`:`invalid`:`unavailable`,e&&m&&C&&!document.hidden&&A(),O()&&(v=requestAnimationFrame(j))}function N(){let t=e(i.value,a.value);m=t.ok,c.hidden=t.ok,t.ok?(i.removeAttribute(`aria-invalid`),a.removeAttribute(`aria-invalid`),c.textContent=``,p=t.average,o.value=f(p),s.textContent=`L = λ × W = ${f(t.rate)} requests/s × ${f(t.seconds)} s = ${f(p)}`):(i.setAttribute(`aria-invalid`,String(!t.rateValid)),a.setAttribute(`aria-invalid`,String(!t.timeValid)),o.value=`—`,s.textContent=`Enter valid averages to calculate.`,c.textContent=t.error),M()}function P(){if(!h||T)return;let e=r.parentElement.getBoundingClientRect(),t=Math.min(devicePixelRatio||1,1.5,1600/Math.max(e.width,e.height));r.width=Math.max(1,Math.round(e.width*t)),r.height=Math.max(1,Math.round(e.height*t)),h.viewport(0,0,r.width,r.height),h.uniform3f(E.iResolution,r.width,r.height,r.width/r.height),m&&C&&!document.hidden&&A()}let F=new IntersectionObserver(e=>{C=e[0].isIntersecting,M()}),I=new ResizeObserver(P);function L(){h&&(D.forEach(e=>h.deleteShader(e)),_&&h.deleteBuffer(_),g&&h.deleteProgram(g),g=null,_=null)}try{if(h=r.getContext(`webgl`,{alpha:!0,antialias:!1,powerPreference:`low-power`}),!h)throw Error(`WebGL unavailable`);let e=(e,t)=>{let n=h.createShader(t);if(!n)throw Error(`Shader allocation failed`);if(D.push(n),h.shaderSource(n,e),h.compileShader(n),!h.getShaderParameter(n,h.COMPILE_STATUS))throw Error(h.getShaderInfoLog(n)||`Shader compilation failed`);return n};if(g=h.createProgram(),!g)throw Error(`Program allocation failed`);if(h.attachShader(g,e(t,h.VERTEX_SHADER)),h.attachShader(g,e(n,h.FRAGMENT_SHADER)),h.linkProgram(g),!h.getProgramParameter(g,h.LINK_STATUS))throw Error(`Shader link failed`);if(h.useProgram(g),_=h.createBuffer(),!_)throw Error(`Buffer allocation failed`);h.bindBuffer(h.ARRAY_BUFFER,_),h.bufferData(h.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),h.STATIC_DRAW);let i=h.getAttribLocation(g,`position`);h.enableVertexAttribArray(i),h.vertexAttribPointer(i,2,h.FLOAT,!1,0,0);for(let e of[`iTime`,`iResolution`,`uColor`,`uAmplitude`,`uDistance`,`uMouse`])E[e]=h.getUniformLocation(g,e);h.uniform3f(E.uColor,.11,.105,.098),h.uniform2f(E.uMouse,.5,.5),h.clearColor(0,0,0,0),P()}catch{L(),h=null}r.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),T=!0,M()}),document.querySelector(`#concurrency-inputs`).disabled=!1,document.querySelector(`#concurrency-form`).addEventListener(`submit`,e=>e.preventDefault()),i.addEventListener(`input`,N),a.addEventListener(`input`,N),u.addEventListener(`click`,()=>{S=!S,M()}),document.addEventListener(`visibilitychange`,M),d.addEventListener(`change`,M),F.observe(r.parentElement),I.observe(r.parentElement),window.addEventListener(`pagehide`,e=>{if(e.persisted){k();return}w=!0,k(),F.disconnect(),I.disconnect(),L(),document.removeEventListener(`visibilitychange`,M),d.removeEventListener(`change`,M)});let R=()=>{setTimeout(()=>{w||N()},0)};window.addEventListener(`pageshow`,R),window.addEventListener(`popstate`,R),N()}var i=document.querySelector(`.phototab-strip`);i&&(i.hidden=!1);var a=document.querySelector(`.phototab-img`),o=document.querySelector(`#product-fullsize`),s=[...document.querySelectorAll(`.phototab-btn`)];for(let e of s)e.addEventListener(`click`,()=>{let t=e.dataset.src;if(t&&a&&o){a.src=t,a.alt=e.dataset.alt||`Gnomon prototype interface`,o.href=t;for(let t of s)t.setAttribute(`aria-pressed`,String(t===e))}});document.querySelector(`#copy-email`)?.addEventListener(`click`,async()=>{let e=document.querySelector(`#copy-status`);try{await navigator.clipboard.writeText(`minhhoang250803@gmail.com`),e&&(e.textContent=`Email copied.`)}catch{e&&(e.textContent=`Select the email address to copy it, or open the email link.`)}}),r();