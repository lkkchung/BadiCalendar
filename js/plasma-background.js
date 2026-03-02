// Plasma Background Animation
// Colors map to Badí' months and days (19 each)

const PALETTE_COLORS = [
  "#FFB000",
  "#FF3300",
  "#E591D0",
  "#9C5CF6",
  "#FFE19E",
  "#82B9FF",
  "#1C8DFF",
  "#8AE6C2",
  "#C2C2C2",
  "#CF27A4",
  "#FA6E4B",
  "#CAA7FB",
  "#3EE6A4",
  "#FFCC59",
  "#B8DBFF",
  "#FF9B82",
  "#5D46F6",
  "#FFC4B5",
  "#FFFFFF",
  "#B8F2DB"
];

// Plasma preset parameters
const PLASMA_PARAMS = {
    blobCount: 3,
    blobSize: 110,
    blur: 50,
    speed: 12,
    baseOpacity: 0.3
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

function createAnimatedBlob(config, id) {
    const { color, size, x, y, duration, delay, blur, opacity } = config;

    const blob = document.createElement('div');
    blob.classList.add('plasma-blob');
    blob.style.cssText = `
        position: absolute;
        width: ${size}%;
        height: ${size}%;
        left: ${x}%;
        top: ${y}%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: ${color};
        filter: blur(${blur}px);
        opacity: ${opacity};
        mix-blend-mode: screen;
        pointer-events: none;
        animation: plasma-drift-${id} ${duration}s ease-in-out ${delay}s infinite;
    `;

    return blob;
}

function injectKeyframes(id, dx1, dy1, s1, dx2, dy2, s2) {
    const name = `plasma-drift-${id}`;
    // Check if already injected
    if (document.getElementById(`keyframes-${name}`)) {
        document.getElementById(`keyframes-${name}`).remove();
    }
    const style = document.createElement('style');
    style.id = `keyframes-${name}`;
    style.textContent = `
        @keyframes ${name} {
            0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
            33% { transform: translate(-50%, -50%) translate(${dx1}%, ${dy1}%) scale(${s1}); }
            66% { transform: translate(-50%, -50%) translate(${dx2}%, ${dy2}%) scale(${s2}); }
        }
    `;
    document.head.appendChild(style);
}

function getColorsForDate(month, day) {
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

    // Clear existing blobs and remove loaded class for fade-in
    container.innerHTML = '';
    container.classList.remove('loaded');

    const midColor = blendColors(colorA, colorB, 0.5);

    // Generate blob configurations using deterministic pseudo-random
    const seed = (colorA + colorB).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pseudoRandom = (i) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;

    const { blobCount, blobSize, blur, speed, baseOpacity } = PLASMA_PARAMS;

    for (let i = 0; i < blobCount; i++) {
        const useA = i % 3 === 0;
        const useB = i % 3 === 1;

        const config = {
            color: useA ? colorA : useB ? colorB : midColor,
            size: blobSize + pseudoRandom(i) * 40,
            x: 20 + pseudoRandom(i * 2) * 60,
            y: 20 + pseudoRandom(i * 3) * 60,
            duration: speed + pseudoRandom(i * 4) * speed,
            delay: pseudoRandom(i * 5) * 2,
            opacity: baseOpacity + pseudoRandom(i * 6) * 0.2,
            blur: blur
        };

        // Inject unique keyframes for each blob with pseudo-random drift
        const dx1 = (pseudoRandom(i * 7) - 0.5) * 20;
        const dy1 = (pseudoRandom(i * 8) - 0.5) * 20;
        const s1 = 0.9 + pseudoRandom(i * 9) * 0.2;
        const dx2 = (pseudoRandom(i * 10) - 0.5) * 20;
        const dy2 = (pseudoRandom(i * 11) - 0.5) * 20;
        const s2 = 0.9 + pseudoRandom(i * 12) * 0.2;
        injectKeyframes(i, dx1, dy1, s1, dx2, dy2, s2);

        const blob = createAnimatedBlob(config, i);
        container.appendChild(blob);
    }

    // Trigger fade-in after all elements are added
    setTimeout(() => {
        container.classList.add('loaded');
    }, 50);
}

export function updatePlasmaColors(badiDate) {
    initPlasmaBackground(badiDate);
}
