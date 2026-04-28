import { Geometry, Mesh, Program, RenderTarget, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

const createTouchTexture = (gl: any) => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new Texture(gl, {
    image: canvas,
    generateMipmaps: false
  });
  const trail: any = [];
  let last: any = null;
  const maxAge = 64;
  let radius = 0.1 * size;
  const speed = 1 / maxAge;
  const clear = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  const drawPoint = (p: any) => {
    const pos = { x: p.x * size, y: (1 - p.y) * size };
    let intensity = 1;
    const easeOutSine = (t: any) => Math.sin((t * Math.PI) / 2);
    const easeOutQuad = (t: any) => -t * (t - 2);
    if (p.age < maxAge * 0.3) intensity = easeOutSine(p.age / (maxAge * 0.3));
    else intensity = easeOutQuad(1 - (p.age - maxAge * 0.3) / (maxAge * 0.7)) || 0;
    intensity *= p.force;
    const color = `${((p.vx + 1) / 2) * 255}, ${((p.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = size * 5;
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius;
    ctx.shadowColor = `rgba(${color},${0.22 * intensity})`;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,1)';
    ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  const addTouch = (norm: any) => {
    let force = 0;
    let vx = 0;
    let vy = 0;
    if (last) {
      const dx = norm.x - last.x;
      const dy = norm.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / (d || 1);
      vy = dy / (d || 1);
      force = Math.min(dd * 10000, 1);
    }
    last = { x: norm.x, y: norm.y };
    trail.push({ x: norm.x, y: norm.y, age: 0, force, vx, vy });
  };
  const update = () => {
    clear();
    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      const f = point.force * speed * (1 - point.age / maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > maxAge) trail.splice(i, 1);
    }
    for (let i = 0; i < trail.length; i++) drawPoint(trail[i]);
    texture.needsUpdate = true;
  };
  return {
    canvas,
    texture,
    addTouch,
    update,
    set radiusScale(v) {
      radius = 0.1 * size * v;
    },
    get radiusScale() {
      return radius / (0.1 * size);
    },
    size
  };
};

const SHAPE_MAP: any = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3
};

const VERTEX_SRC = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;
uniform float uSaturation;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;
const int   RIPPLE_FLOATS = 30;

uniform float uRippleData[RIPPLE_FLOATS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.0;
  const float dampR     = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = vec2(uRippleData[i * 3 + 0], uRippleData[i * 3 + 1]);
      if (pos.x < 0.0) continue;
      float cellPixelSize = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uRippleData[i * 3 + 2], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;
  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;
  vec3 grey = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
  color = clamp(grey + (color - grey) * uSaturation, 0.0, 1.0);

  // sRGB gamma correction - convert linear to sRGB for accurate color output
  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );

  fragColor = vec4(srgbColor, M);
}
`;

const POST_VERT = `attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const LIQUID_FRAG = `
precision highp float;
uniform sampler2D tMap;
uniform sampler2D uTexture;
uniform float uStrength;
uniform float uTime;
uniform float uFreq;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec4 tex = texture2D(uTexture, uv);
  float vx = tex.r * 2.0 - 1.0;
  float vy = tex.g * 2.0 - 1.0;
  float intensity = tex.b;
  float wave = 0.5 + 0.5 * sin(uTime * uFreq + intensity * 6.2831853);
  float amt = uStrength * intensity * wave;
  uv += vec2(vx, vy) * amt;
  gl_FragColor = texture2D(tMap, uv);
}
`;

const NOISE_FRAG = `
precision highp float;
uniform sampler2D tMap;
uniform float uTime;
uniform float uAmount;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
void main() {
  vec4 inputColor = texture2D(tMap, vUv);
  float n = hash(floor(vUv * vec2(1920.0,1080.0)) + floor(uTime * 60.0));
  float g = (n - 0.5) * uAmount;
  gl_FragColor = inputColor + vec4(vec3(g), 0.0);
}
`;

const MAX_CLICKS = 10;
/** OGL Program uploads array uniforms best as a single float[] (uniform1fv), not vec2[] */
const RIPPLE_FLOATS = MAX_CLICKS * 3;
const FULLSCREEN_POSITIONS = new Float32Array([-1, -1, 3, -1, -1, 3]);
const FULLSCREEN_UVS = new Float32Array([0, 0, 2, 0, 0, 2]);

const hexToVec3 = (hex: string) => {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const num = Number.parseInt(value, 16);
  if (Number.isNaN(num)) return new Float32Array([0, 0, 0]);
  return new Float32Array([((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255]);
};

const PixelBlast = ({
  variant = 'square',
  pixelSize = 2,
  color = '#85abfa',
  /** >1 increases saturation (chrominance scaled relative to luma). */
  colorSaturation = 1,
  className,
  style,
  antialias = true,
  patternScale = 2,
  patternDensity = 1,
  liquid = false,
  liquidStrength = 0.1,
  liquidRadius = 1,
  pixelSizeJitter = 0,
  enableRipples = true,
  rippleIntensityScale = 1,
  rippleThickness = 0.27,
  rippleSpeed = 0.55,
  liquidWobbleSpeed = 4.5,
  autoPauseOffscreen = true,
  speed = 0.5,
  transparent = true,
  edgeFade = 0.01,
  noiseAmount = 0
}: any) => {
  const containerRef = useRef<any>(null);
  const visibilityRef = useRef<any>({ visible: true });
  const speedRef = useRef<any>(speed);

  const oglRef = useRef<any>(null);
  const prevConfigRef = useRef<any>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    speedRef.current = speed;
    const needsReinitKeys = ['antialias', 'liquid', 'noiseAmount'];
    const cfg: any = { antialias, liquid, noiseAmount };
    let mustReinit = false;
    if (!oglRef.current) mustReinit = true;
    else if (prevConfigRef.current) {
      for (const k of needsReinitKeys)
        if (prevConfigRef.current[k] !== cfg[k]) {
          mustReinit = true;
          break;
        }
    }
    if (mustReinit) {
      if (oglRef.current) {
        const t = oglRef.current;
        t.resizeObserver?.disconnect();
        cancelAnimationFrame(t.raf);
        t.renderer.gl?.getExtension('WEBGL_lose_context')?.loseContext();
        if (t.renderer.gl.canvas.parentElement === container) container.removeChild(t.renderer.gl.canvas);
        oglRef.current = null;
      }
      const renderer = new Renderer({
        antialias,
        alpha: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        powerPreference: 'high-performance'
      });
      const gl = renderer.gl as any;
      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      container.appendChild(canvas);
      const uniforms = {
        uResolution: { value: new Float32Array([0, 0]) },
        uTime: { value: 0 },
        uColor: { value: hexToVec3(color) },
        uRippleData: { value: new Float32Array(RIPPLE_FLOATS).fill(-1) },
        uShapeType: { value: SHAPE_MAP[variant] ?? 0 },
        uPixelSize: { value: pixelSize * renderer.dpr },
        uScale: { value: patternScale },
        uDensity: { value: patternDensity },
        uPixelJitter: { value: pixelSizeJitter },
        uEnableRipples: { value: enableRipples ? 1 : 0 },
        uRippleSpeed: { value: rippleSpeed },
        uRippleThickness: { value: rippleThickness },
        uRippleIntensity: { value: rippleIntensityScale },
        uEdgeFade: { value: edgeFade },
        uSaturation: { value: colorSaturation }
      };
      const scene = new Transform();
      const geometry = new Geometry(gl, {
        position: { size: 2, data: FULLSCREEN_POSITIONS }
      });
      const program = new Program(gl, {
        vertex: VERTEX_SRC,
        fragment: FRAGMENT_SRC,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
      const quad = new Mesh(gl, { geometry, program });
      quad.setParent(scene);
      const setSize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h);
        uniforms.uResolution.value[0] = canvas.width;
        uniforms.uResolution.value[1] = canvas.height;
        uniforms.uPixelSize.value = pixelSize * renderer.dpr;
        if (oglRef.current?.mainTarget) oglRef.current.mainTarget.setSize(canvas.width, canvas.height);
        if (oglRef.current?.liquidTarget) oglRef.current.liquidTarget.setSize(canvas.width, canvas.height);
      };
      setSize();
      const ro = new ResizeObserver(setSize);
      ro.observe(container);
      const randomFloat = () => {
        if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
          const u32 = new Uint32Array(1);
          window.crypto.getRandomValues(u32);
          return u32[0] / 0xffffffff;
        }
        return Math.random();
      };
      const timeOffset = randomFloat() * 1000;
      let mainTarget: any;
      let liquidTarget: any;
      let touch: any;
      let liquidPass: any;
      let noisePass: any;
      const postGeometry = new Geometry(gl, {
        position: { size: 2, data: FULLSCREEN_POSITIONS },
        uv: { size: 2, data: FULLSCREEN_UVS }
      });
      if (liquid) {
        touch = createTouchTexture(gl);
        touch.radiusScale = liquidRadius;
        liquidPass = new Mesh(gl, {
          geometry: postGeometry,
          program: new Program(gl, {
            vertex: POST_VERT,
            fragment: LIQUID_FRAG,
            uniforms: {
              tMap: { value: null },
              uTexture: { value: touch.texture },
              uStrength: { value: liquidStrength },
              uTime: { value: 0 },
              uFreq: { value: liquidWobbleSpeed }
            },
            transparent: true,
            depthTest: false
          })
        });
      }
      if (noiseAmount > 0) {
        noisePass = new Mesh(gl, {
          geometry: postGeometry,
          program: new Program(gl, {
            vertex: POST_VERT,
            fragment: NOISE_FRAG,
            uniforms: {
              tMap: { value: null },
              uTime: { value: 0 },
              uAmount: { value: noiseAmount }
            },
            transparent: true,
            depthTest: false
          })
        });
      }
      if (liquid || noiseAmount > 0) {
        mainTarget = new RenderTarget(gl, {
          width: gl.canvas.width,
          height: gl.canvas.height,
          depth: false
        });
      }
      if (liquid && noiseAmount > 0) {
        liquidTarget = new RenderTarget(gl, {
          width: gl.canvas.width,
          height: gl.canvas.height,
          depth: false
        });
      }
      const mapToPixels = (e: any) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const fx = (e.clientX - rect.left) * scaleX;
        const fy = (rect.height - (e.clientY - rect.top)) * scaleY;
        return {
          fx,
          fy,
          w: canvas.width,
          h: canvas.height
        };
      };
      const onPointerDown = (e: any) => {
        const { fx, fy } = mapToPixels(e);
        const ix = oglRef.current?.clickIx ?? 0;
        uniforms.uRippleData.value[ix * 3] = fx;
        uniforms.uRippleData.value[ix * 3 + 1] = fy;
        uniforms.uRippleData.value[ix * 3 + 2] = uniforms.uTime.value;
        if (oglRef.current) oglRef.current.clickIx = (ix + 1) % MAX_CLICKS;
      };
      const onPointerMove = (e: any) => {
        if (!touch) return;
        const { fx, fy, w, h } = mapToPixels(e);
        touch.addTouch({ x: fx / w, y: fy / h });
      };
      canvas.addEventListener('pointerdown', onPointerDown, {
        passive: true
      });
      canvas.addEventListener('pointermove', onPointerMove, {
        passive: true
      });
      const startTime = performance.now();
      let raf = 0;
      const animate = () => {
        if (autoPauseOffscreen && !visibilityRef.current.visible) {
          raf = requestAnimationFrame(animate);
          return;
        }
        uniforms.uTime.value = timeOffset + ((performance.now() - startTime) / 1000) * speedRef.current;
        if (transparent) gl.clearColor(0, 0, 0, 0);
        else gl.clearColor(0, 0, 0, 1);
        if (liquidPass || noisePass) {
          if (touch) touch.update();
          renderer.render({ scene, target: mainTarget });
          let sourceTex = mainTarget.texture;
          if (liquidPass) {
            liquidPass.program.uniforms.tMap.value = sourceTex;
            liquidPass.program.uniforms.uTime.value = uniforms.uTime.value;
            liquidPass.program.uniforms.uStrength.value = liquidStrength;
            liquidPass.program.uniforms.uFreq.value = liquidWobbleSpeed;
            if (noisePass && liquidTarget) {
              renderer.render({ scene: liquidPass, target: liquidTarget });
              sourceTex = liquidTarget.texture;
            } else {
              renderer.render({ scene: liquidPass });
              sourceTex = null;
            }
          }
          if (noisePass) {
            noisePass.program.uniforms.tMap.value = sourceTex ?? mainTarget.texture;
            noisePass.program.uniforms.uTime.value = uniforms.uTime.value;
            noisePass.program.uniforms.uAmount.value = noiseAmount;
            renderer.render({ scene: noisePass });
          }
        } else {
          renderer.render({ scene });
        }
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
      oglRef.current = {
        renderer,
        scene,
        gl,
        program,
        clickIx: 0,
        uniforms,
        resizeObserver: ro,
        raf,
        quad,
        timeOffset,
        mainTarget,
        liquidTarget,
        touch,
        liquidPass,
        noisePass
      };
    } else {
      const t = oglRef.current;
      t.uniforms.uShapeType.value = SHAPE_MAP[variant] ?? 0;
      t.uniforms.uPixelSize.value = pixelSize * t.renderer.dpr;
      t.uniforms.uColor.value = hexToVec3(color);
      t.uniforms.uScale.value = patternScale;
      t.uniforms.uDensity.value = patternDensity;
      t.uniforms.uPixelJitter.value = pixelSizeJitter;
      t.uniforms.uEnableRipples.value = enableRipples ? 1 : 0;
      t.uniforms.uRippleIntensity.value = rippleIntensityScale;
      t.uniforms.uRippleThickness.value = rippleThickness;
      t.uniforms.uRippleSpeed.value = rippleSpeed;
      t.uniforms.uEdgeFade.value = edgeFade;
      t.uniforms.uSaturation.value = colorSaturation;
      if (t.liquidPass) {
        t.liquidPass.program.uniforms.uStrength.value = liquidStrength;
        t.liquidPass.program.uniforms.uFreq.value = liquidWobbleSpeed;
      }
      if (t.touch) t.touch.radiusScale = liquidRadius;
      if (t.noisePass) t.noisePass.program.uniforms.uAmount.value = noiseAmount;
    }
    prevConfigRef.current = cfg;
    return () => {
      if (oglRef.current && mustReinit) return;
      if (!oglRef.current) return;
      const t = oglRef.current;
      t.resizeObserver?.disconnect();
      cancelAnimationFrame(t.raf);
      t.renderer.gl?.getExtension('WEBGL_lose_context')?.loseContext();
      if (t.renderer.gl.canvas.parentElement === container) container.removeChild(t.renderer.gl.canvas);
      oglRef.current = null;
    };
  }, [
    antialias,
    liquid,
    noiseAmount,
    pixelSize,
    patternScale,
    patternDensity,
    enableRipples,
    rippleIntensityScale,
    rippleThickness,
    rippleSpeed,
    pixelSizeJitter,
    edgeFade,
    transparent,
    liquidStrength,
    liquidRadius,
    liquidWobbleSpeed,
    autoPauseOffscreen,
    variant,
    color,
    colorSaturation,
    speed
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className ?? ''}`}
      style={style}
      aria-label="PixelBlast interactive background"
    />
  );
};

export default PixelBlast;
