import { useState, useEffect, useRef } from "react";

const DEFAULT_COLOR_A = "#1B8DFF";
const DEFAULT_COLOR_B = "#FF6944";

function hexToRgb(hex) {
  const c = hex.replace("#", "");
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

function blendColors(hex1, hex2, ratio) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r * (1 - ratio) + c2.r * ratio);
  const g = Math.round(c1.g * (1 - ratio) + c2.g * ratio);
  const b = Math.round(c1.b * (1 - ratio) + c2.b * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = "" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888", marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#666" }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#555" }}
      />
    </div>
  );
}

function AnimatedBlob({ color, size, x, y, duration, delay, blur, opacity, morph }) {
  const blobId = useRef(`blob-${Math.random().toString(36).slice(2)}`);
  
  // Generate organic blob path variations for morphing
  const generateBlobPath = (seed, variance) => {
    const points = 8;
    const angleStep = (Math.PI * 2) / points;
    const radius = 40;
    
    let path = "";
    const coords = [];
    
    for (let i = 0; i < points; i++) {
      const angle = i * angleStep;
      const r = radius + Math.sin(seed + i * 1.5) * variance;
      const x = 50 + Math.cos(angle) * r;
      const y = 50 + Math.sin(angle) * r;
      coords.push({ x, y });
    }
    
    // Create smooth curve through points
    path = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length; i++) {
      const p0 = coords[(i - 1 + coords.length) % coords.length];
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      const p3 = coords[(i + 2) % coords.length];
      
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    path += " Z";
    return path;
  };

  const path1 = generateBlobPath(0, morph);
  const path2 = generateBlobPath(2, morph);
  const path3 = generateBlobPath(4, morph);
  const path4 = generateBlobPath(6, morph);

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        width: `${size}%`,
        height: `${size}%`,
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        filter: `blur(${blur}px)`,
        opacity: opacity,
        mixBlendMode: "screen",
      }}
    >
      <path fill={color}>
        <animate
          attributeName="d"
          dur={`${duration}s`}
          repeatCount="indefinite"
          begin={`${delay}s`}
          values={`${path1};${path2};${path3};${path4};${path1}`}
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
        />
        <animateMotion
          dur={`${duration * 1.5}s`}
          repeatCount="indefinite"
          begin={`${delay}s`}
          path={`M 0,0 Q ${10 - Math.random() * 20},${10 - Math.random() * 20} 0,0`}
        />
      </path>
    </svg>
  );
}

function AuraCard({ colorA, colorB, params, size = 280, label, animate = true }) {
  const {
    blobCount,
    blobSize,
    blur,
    speed,
    morph,
    baseOpacity,
    grain,
  } = params;

  const noiseId = useRef(`noise-${Math.random().toString(36).slice(2)}`);
  const midColor = blendColors(colorA, colorB, 0.5);

  // Generate blob configurations
  const blobs = [];
  const seed = (colorA + colorB).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const pseudoRandom = (i) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;

  for (let i = 0; i < blobCount; i++) {
    const useA = i % 3 === 0;
    const useB = i % 3 === 1;
    const useMid = i % 3 === 2;
    
    blobs.push({
      color: useA ? colorA : useB ? colorB : midColor,
      size: blobSize + pseudoRandom(i) * 40,
      x: 20 + pseudoRandom(i * 2) * 60,
      y: 20 + pseudoRandom(i * 3) * 60,
      duration: speed + pseudoRandom(i * 4) * speed,
      delay: pseudoRandom(i * 5) * 2,
      opacity: baseOpacity / 100 + pseudoRandom(i * 6) * 0.2,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          position: "relative",
          overflow: "hidden",
          background: "#000",
          boxShadow: `
            0 0 ${blur * 0.5}px ${midColor}40,
            0 0 ${blur}px ${midColor}20,
            0 8px 32px rgba(0,0,0,0.6)
          `,
        }}
      >
        {/* Dark base */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 100%)`,
          }}
        />

        {/* Animated blobs */}
        {blobs.map((blob, i) => (
          <AnimatedBlob
            key={i}
            color={blob.color}
            size={blob.size}
            x={blob.x}
            y={blob.y}
            duration={animate ? blob.duration : 999999}
            delay={blob.delay}
            blur={blur}
            opacity={blob.opacity}
            morph={morph}
          />
        ))}

        {/* Additional large ambient blobs for base coverage */}
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            background: `radial-gradient(ellipse 60% 50% at 30% 70%, ${colorA}66 0%, transparent 60%)`,
            filter: `blur(${blur * 1.5}px)`,
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            background: `radial-gradient(ellipse 50% 60% at 70% 30%, ${colorB}66 0%, transparent 60%)`,
            filter: `blur(${blur * 1.5}px)`,
            mixBlendMode: "screen",
          }}
        />

        {/* Grain overlay */}
        {grain > 0 && (
          <>
            <svg style={{ position: "absolute", width: 0, height: 0 }}>
              <filter id={noiseId.current}>
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                filter: `url(#${noiseId.current})`,
                opacity: grain / 100,
                mixBlendMode: "overlay",
              }}
            />
          </>
        )}
      </div>
      
      {label && (
        <div style={{ fontSize: 10, color: "#666", letterSpacing: 1, textTransform: "uppercase" }}>
          {label}
        </div>
      )}
    </div>
  );
}

export default function AuraStudy() {
  const [colorA, setColorA] = useState(DEFAULT_COLOR_A);
  const [colorB, setColorB] = useState(DEFAULT_COLOR_B);
  const [animate, setAnimate] = useState(true);
  
  const [blobCount, setBlobCount] = useState(6);
  const [blobSize, setBlobSize] = useState(60);
  const [blur, setBlur] = useState(40);
  const [speed, setSpeed] = useState(8);
  const [morph, setMorph] = useState(15);
  const [baseOpacity, setBaseOpacity] = useState(70);
  const [grain, setGrain] = useState(10);

  const params = {
    blobCount,
    blobSize,
    blur,
    speed,
    morph,
    baseOpacity,
    grain,
  };

  const presets = {
    "Lava Lamp": {
      blobCount: 5, blobSize: 70, blur: 50, speed: 10, morph: 18, baseOpacity: 80, grain: 8,
    },
    "Plasma": {
      blobCount: 8, blobSize: 50, blur: 35, speed: 5, morph: 20, baseOpacity: 75, grain: 5,
    },
    "Soft Glow": {
      blobCount: 4, blobSize: 80, blur: 60, speed: 12, morph: 10, baseOpacity: 60, grain: 12,
    },
    "Dense Cloud": {
      blobCount: 10, blobSize: 45, blur: 45, speed: 8, morph: 15, baseOpacity: 65, grain: 15,
    },
    "Subtle": {
      blobCount: 3, blobSize: 90, blur: 70, speed: 15, morph: 8, baseOpacity: 50, grain: 10,
    },
    "Intense": {
      blobCount: 7, blobSize: 55, blur: 30, speed: 6, morph: 22, baseOpacity: 90, grain: 3,
    },
  };

  const applyPreset = (name) => {
    const p = presets[name];
    setBlobCount(p.blobCount);
    setBlobSize(p.blobSize);
    setBlur(p.blur);
    setSpeed(p.speed);
    setMorph(p.morph);
    setBaseOpacity(p.baseOpacity);
    setGrain(p.grain);
  };

  const paletteColors = [
    "#FF3300", "#FF6944", "#FF9B83", "#FFC4B6", "#FEE19D", "#FFCC59", "#FFB001",
    "#1B8DFF", "#83B9FF", "#B9DBFF", "#B6ADFE", "#9284FF",
    "#ED85D2", "#E467C5", "#CF26A3", "#94EBC9", "#7FCAAC", "#6CAA91", "#C2C2C2"
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#e8e8e4",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 32px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 28,
                fontWeight: 300,
                letterSpacing: -0.5,
                marginBottom: 4,
              }}
            >
              Aura Study · Animated Blobs
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              SVG blobs · Screen blend · Heavy blur
            </div>
          </div>
          <button
            onClick={() => setAnimate(!animate)}
            style={{
              padding: "8px 16px",
              fontSize: 11,
              background: animate ? "#1a3a1a" : "#1a1a1a",
              border: animate ? "1px solid #2a5a2a" : "1px solid #333",
              borderRadius: 6,
              color: animate ? "#6a6" : "#888",
              cursor: "pointer",
            }}
          >
            {animate ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 48 }}>
          {/* Controls */}
          <div>
            {/* Colors */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#555", marginBottom: 12 }}>
                Colors
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Color A</div>
                  <input
                    type="color"
                    value={colorA}
                    onChange={(e) => setColorA(e.target.value)}
                    style={{ width: 48, height: 32, border: "none", borderRadius: 4, cursor: "pointer" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Color B</div>
                  <input
                    type="color"
                    value={colorB}
                    onChange={(e) => setColorB(e.target.value)}
                    style={{ width: 48, height: 32, border: "none", borderRadius: 4, cursor: "pointer" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {paletteColors.map((c) => (
                  <div
                    key={c}
                    onClick={() => setColorA(c)}
                    onContextMenu={(e) => { e.preventDefault(); setColorB(c); }}
                    style={{
                      width: 16, height: 16, borderRadius: 3, background: c, cursor: "pointer",
                      border: (c === colorA || c === colorB) ? "2px solid white" : "1px solid #333",
                      boxSizing: "border-box",
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 9, color: "#444", marginTop: 6 }}>
                Left-click = A · Right-click = B
              </div>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#555", marginBottom: 10 }}>
                Presets
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.keys(presets).map((name) => (
                  <button
                    key={name}
                    onClick={() => applyPreset(name)}
                    style={{
                      padding: "6px 10px",
                      fontSize: 10,
                      background: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: 4,
                      color: "#888",
                      cursor: "pointer",
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Blob controls */}
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#555", marginBottom: 10 }}>
              Blobs
            </div>
            <Slider label="Count" value={blobCount} onChange={setBlobCount} min={2} max={12} />
            <Slider label="Size" value={blobSize} onChange={setBlobSize} min={30} max={100} unit="%" />
            <Slider label="Morph Amount" value={morph} onChange={setMorph} min={5} max={25} />
            <Slider label="Opacity" value={baseOpacity} onChange={setBaseOpacity} min={30} max={100} unit="%" />

            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#555", marginBottom: 10, marginTop: 20 }}>
              Animation
            </div>
            <Slider label="Speed (slower →)" value={speed} onChange={setSpeed} min={3} max={20} unit="s" />

            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#555", marginBottom: 10, marginTop: 20 }}>
              Effects
            </div>
            <Slider label="Blur" value={blur} onChange={setBlur} min={20} max={80} unit="px" />
            <Slider label="Grain" value={grain} onChange={setGrain} min={0} max={25} unit="%" />
          </div>

          {/* Preview */}
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
              <AuraCard colorA={colorA} colorB={colorB} params={params} size={380} animate={animate} />
            </div>

            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#555", marginBottom: 16 }}>
              Presets with Current Colors
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
              {Object.entries(presets).map(([name, p]) => (
                <AuraCard key={name} colorA={colorA} colorB={colorB} params={p} size={150} label={name} animate={animate} />
              ))}
            </div>

            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#555", marginBottom: 16 }}>
              Current Settings · Color Pairs
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {[
                ["#FFB001", "#9284FF"],
                ["#CF26A3", "#94EBC9"],
                ["#FF3300", "#1B8DFF"],
                ["#6CAA91", "#E467C5"],
                ["#FF6944", "#B6ADFE"],
                ["#FFCC59", "#83B9FF"],
                ["#ED85D2", "#7FCAAC"],
                ["#B9DBFF", "#FF9B83"],
                ["#9284FF", "#FEE19D"],
                ["#CF26A3", "#FFB001"],
              ].map(([a, b], i) => (
                <AuraCard key={i} colorA={a} colorB={b} params={params} size={100} animate={animate} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
