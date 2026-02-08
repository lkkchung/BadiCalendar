// Plasma Background Animation
// Colors map to Badí' months and days (19 each)

const PALETTE_COLORS = [
  "#FF3300", "#FF6944", "#FF9B83", "#FFC4B6", "#FEE19D", "#FFCC59", "#FFB001",
  "#1B8DFF", "#83B9FF", "#B9DBFF", "#B6ADFE", "#9284FF",
  "#ED85D2", "#E467C5", "#CF26A3", "#94EBC9", "#7FCAAC", "#6CAA91", "#C2C2C2"
];

// Plasma preset parameters
const PLASMA_PARAMS = {
    blobCount: 8,
    blobSize: 50,
    blur: 35,
    speed: 5,
    morph: 20,
    baseOpacity: 0.75,
    grain: 0.05
};

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

function generateBlobPath(seed, variance) {
    const points = 8;
    const angleStep = (Math.PI * 2) / points;
    const radius = 40;

    const coords = [];

    for (let i = 0; i < points; i++) {
        const angle = i * angleStep;
        const r = radius + Math.sin(seed + i * 1.5) * variance;
        const x = 50 + Math.cos(angle) * r;
        const y = 50 + Math.sin(angle) * r;
        coords.push({ x, y });
    }

    // Create smooth curve through points
    let path = `M ${coords[0].x},${coords[0].y}`;
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
}

function createAnimatedBlob(config, id) {
    const { color, size, x, y, duration, delay, blur, opacity, morph } = config;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.classList.add("plasma-blob");
    svg.style.cssText = `
        position: absolute;
        width: ${size}%;
        height: ${size}%;
        left: ${x}%;
        top: ${y}%;
        transform: translate(-50%, -50%);
        filter: blur(${blur}px);
        opacity: ${opacity};
        mix-blend-mode: screen;
        pointer-events: none;
    `;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", color);

    // Generate morph animation keyframes
    const path1 = generateBlobPath(0, morph);
    const path2 = generateBlobPath(2, morph);
    const path3 = generateBlobPath(4, morph);
    const path4 = generateBlobPath(6, morph);

    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animate.setAttribute("attributeName", "d");
    animate.setAttribute("dur", `${duration}s`);
    animate.setAttribute("repeatCount", "indefinite");
    animate.setAttribute("begin", `${delay}s`);
    animate.setAttribute("values", `${path1};${path2};${path3};${path4};${path1}`);
    animate.setAttribute("calcMode", "spline");
    animate.setAttribute("keySplines", "0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1");

    path.appendChild(animate);
    svg.appendChild(path);

    return svg;
}

function getColorsForDate(month, day) {
    // Month: 1-19 (or 0 for Ayyam-i-Ha, handle later)
    // Day: 1-19

    // For now, use month for colorA, day for colorB
    const monthIndex = (month - 1) % 19;
    const dayIndex = (day - 1) % 19;

    const colorA = PALETTE_COLORS[monthIndex];
    const colorB = PALETTE_COLORS[dayIndex];

    return { colorA, colorB };
}

export function initPlasmaBackground(badiDate) {
    const { month, day } = badiDate;
    const { colorA, colorB } = getColorsForDate(month, day);

    // Create container
    const container = document.getElementById('plasma-background');
    if (!container) {
        console.error('Plasma background container not found');
        return;
    }

    // Clear existing blobs
    container.innerHTML = '';

    const midColor = blendColors(colorA, colorB, 0.5);

    // Generate blob configurations using deterministic pseudo-random
    const seed = (colorA + colorB).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pseudoRandom = (i) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;

    const { blobCount, blobSize, blur, speed, morph, baseOpacity } = PLASMA_PARAMS;

    for (let i = 0; i < blobCount; i++) {
        const useA = i % 3 === 0;
        const useB = i % 3 === 1;
        const useMid = i % 3 === 2;

        const config = {
            color: useA ? colorA : useB ? colorB : midColor,
            size: blobSize + pseudoRandom(i) * 40,
            x: 20 + pseudoRandom(i * 2) * 60,
            y: 20 + pseudoRandom(i * 3) * 60,
            duration: speed + pseudoRandom(i * 4) * speed,
            delay: pseudoRandom(i * 5) * 2,
            opacity: baseOpacity + pseudoRandom(i * 6) * 0.2,
            blur: blur,
            morph: morph
        };

        const blob = createAnimatedBlob(config, `blob-${i}`);
        container.appendChild(blob);
    }

    // Add ambient background blobs
    const ambient1 = document.createElement('div');
    ambient1.className = 'plasma-ambient';
    ambient1.style.cssText = `
        position: absolute;
        inset: -20%;
        background: radial-gradient(ellipse 60% 50% at 30% 70%, ${colorA}66 0%, transparent 60%);
        filter: blur(${blur * 1.5}px);
        mix-blend-mode: screen;
        pointer-events: none;
    `;
    container.appendChild(ambient1);

    const ambient2 = document.createElement('div');
    ambient2.className = 'plasma-ambient';
    ambient2.style.cssText = `
        position: absolute;
        inset: -20%;
        background: radial-gradient(ellipse 50% 60% at 70% 30%, ${colorB}66 0%, transparent 60%);
        filter: blur(${blur * 1.5}px);
        mix-blend-mode: screen;
        pointer-events: none;
    `;
    container.appendChild(ambient2);
}

export function updatePlasmaColors(badiDate) {
    initPlasmaBackground(badiDate);
}
