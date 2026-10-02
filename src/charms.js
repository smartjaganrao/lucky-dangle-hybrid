// charms.js - Catalog, Beads, and Asset definitions for Lucky Dangle

// ---------------------------------------------------------------------------
// Original vector charms (art type "svg").
// Local space: (0,0) is where the cord meets the charm, +y points down.
// Shared gradients (ld-*) live in getSvgDefs().
// ---------------------------------------------------------------------------

const DIYA_SVG = `
  <circle cx="0" cy="3" r="3" fill="none" stroke="url(#ld-brass)" stroke-width="1.6"/>
  <path d="M0 6 L-19 33 M0 6 L0 31 M0 6 L19 33" stroke="url(#ld-brass)" stroke-width="1.1" stroke-dasharray="2.2 1.2" fill="none"/>
  <path d="M22 33 Q30 31 31 26 L26 35 Z" fill="url(#ld-brass)"/>
  <path d="M-26 34 Q-24 52 0 54 Q24 52 26 34 Z" fill="url(#ld-brass)"/>
  <ellipse cx="0" cy="34" rx="26" ry="4" fill="#7a4a12"/>
  <ellipse cx="0" cy="34" rx="22" ry="2.6" fill="#3a2208"/>
  <path d="M-19 42 Q0 47 19 42" stroke="#fff3c4" stroke-opacity="0.45" fill="none" stroke-width="1"/>
  <circle cx="-10" cy="46" r="1.3" fill="#fff3c4" fill-opacity="0.6"/>
  <circle cx="0" cy="48" r="1.3" fill="#fff3c4" fill-opacity="0.6"/>
  <circle cx="10" cy="46" r="1.3" fill="#fff3c4" fill-opacity="0.6"/>
  <path d="M-4 54 L0 62 L4 54 Z" fill="url(#ld-brass)"/>
  <g transform="translate(30 25)">
    <g class="ld-flame-boost">
      <circle class="ld-flame-glow" r="10" fill="url(#ld-flameglow)"/>
      <g class="ld-flame">
        <path d="M0 2 C-4 -2 -3 -8 0 -13 C3 -8 4 -2 0 2 Z" fill="#f07a1a"/>
        <path d="M0 1.5 C-2 -1 -1.5 -5 0 -8 C1.5 -5 2 -1 0 1.5 Z" fill="#ffe08a"/>
      </g>
    </g>
  </g>`;

const VEL_SVG = `
  <ellipse class="ld-vel-glow" cx="0" cy="28" rx="22" ry="30" fill="url(#ld-halo)" opacity="0"/>
  <circle cx="0" cy="3" r="3" fill="none" stroke="url(#ld-gold)" stroke-width="1.6"/>
  <path d="M0 6 C9 16 13 26 11 34 C9 41 4 45 0 47 C-4 45 -9 41 -11 34 C-13 26 -9 16 0 6 Z" fill="url(#ld-gold)" stroke="#8a5a0c" stroke-width="0.8"/>
  <path d="M0 11 C6 19 8 27 7 33 C6 38 3 41 0 42 C-3 41 -6 38 -7 33 C-8 27 -6 19 0 11 Z" fill="none" stroke="#fff3c4" stroke-opacity="0.55" stroke-width="0.8"/>
  <path d="M-6 26 H6 M-6.5 28.6 H6.5 M-6 31.2 H6" stroke="#fffaf0" stroke-width="1.1" stroke-linecap="round"/>
  <circle cx="0" cy="28.6" r="1.7" fill="#c2203c"/>
  <rect x="-5" y="47" width="10" height="4" rx="1.5" fill="url(#ld-gold)" stroke="#8a5a0c" stroke-width="0.5"/>
  <circle cx="0" cy="54" r="3" fill="url(#dg-g-lacquerRed)"/>
  <rect x="-1.6" y="57" width="3.2" height="24" rx="1.2" fill="url(#ld-gold)"/>
  <path d="M-3 81 L3 81 L0 87 Z" fill="url(#ld-gold)"/>`;

function marigoldSvg() {
  const flower = (cy, petal, center, dot, r) => {
    let petals = "";
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      petals += `<circle cx="${(Math.cos(a) * r * 0.72).toFixed(2)}" cy="${(cy + Math.sin(a) * r * 0.72).toFixed(2)}" r="${(r * 0.42).toFixed(2)}" fill="${petal}"/>`;
    }
    return `${petals}<circle cy="${cy}" r="${(r * 0.6).toFixed(2)}" fill="${center}"/><circle cy="${cy}" r="${(r * 0.22).toFixed(2)}" fill="${dot}"/>`;
  };
  let out = `<path d="M0 0 V84" stroke="#3f7d2c" stroke-width="1"/>`;
  [8, 21, 34, 47, 60, 73].forEach((cy, i) => {
    out += i % 2 === 0
      ? flower(cy, "#e8661a", "#f07a1a", "#a8400c", 7)
      : flower(cy, "#f2b134", "#f7c64e", "#c4820c", 6.4);
  });
  out += `<path d="M0 80 C-8 88 -7 98 0 104 C7 98 8 88 0 80 Z" fill="#3f7d2c"/><path d="M0 82 V102" stroke="#2a5a1c" stroke-width="0.9"/>`;
  return out;
}

const CHARMS = [
  {
    slug: "diya",
    name: "Thooku vilakku",
    origin: "Tamil Nadu, India",
    description: "A brass hanging lamp, lit at dusk so the home is never in darkness. Light the diya when you start something new.",
    ritual: { kind: "diya", label: "Light the diya" },
    art: { type: "svg", markup: DIYA_SVG, frame: [64, 64], viewBox: "-32 -2 68 66" },
    attach: 0,
    hangOffset: 32,
    beads: { small: "glass:gold", big: "glass:lacquerRed", raise: 0, bigSize: 12 }
  },
  {
    slug: "vel",
    name: "Vel",
    origin: "Tamil Nadu, India",
    description: "Lord Murugan's leaf-bladed spear, a sign of courage and clear sight. Raise the vel when you need strength for the day.",
    ritual: { kind: "vel", label: "Raise the vel" },
    art: { type: "svg", markup: VEL_SVG, frame: [30, 88], viewBox: "-24 -2 48 92" },
    attach: 0,
    hangOffset: 40,
    beads: { small: "glass:gold", big: "glass:lacquerRed", raise: 0, bigSize: 12 }
  },
  {
    slug: "marigold",
    name: "Genda phool",
    origin: "India",
    description: "A string of marigolds with a mango leaf, hung over doorways for every festival. Give it a flick to shake out the old week.",
    ritual: { kind: "flick", label: "Give it a flick" },
    art: { type: "svg", markup: marigoldSvg(), frame: [20, 104], viewBox: "-12 -2 24 108" },
    attach: 0,
    hangOffset: 50,
    beads: null
  },
  {
    slug: "nazar",
    name: "Nazar boncuğu",
    origin: "Turkey and the Mediterranean",
    description: "A glass eye worn against the evil eye. Give it a flick when you want a little cover.",
    ritual: { kind: "flick", label: "Give it a flick" },
    art: { type: "image", src: "../assets/charms/nazar.png", frame: [64, 64] },
    attach: 0.15,
    hangOffset: 22.4,
    beads: { small: "glass:white", big: "eye", raise: 0, bigSize: 12 }
  },
  {
    slug: "hamsa",
    name: "Hamsa",
    origin: "Middle East and North Africa",
    description: "An open hand carried for protection and good fortune. Give it a flick to send bad luck on its way.",
    ritual: { kind: "flick", label: "Give it a flick" },
    art: { type: "image", src: "../assets/charms/hamsa.png", frame: [64, 84] },
    attach: 0.12,
    hangOffset: 32,
    beads: { small: "glass:gold", big: "glass:deepBlue", raise: 0, bigSize: 12 }
  },
  {
    slug: "nimbu-mirchi",
    name: "Nimbu-mirchi",
    origin: "India",
    description: "Seven chilies and a lemon hung at the threshold to turn away misfortune. Replace it with a fresh one when the week is up.",
    ritual: { kind: "garland", label: "Hang a fresh garland" },
    art: { type: "garland" },
    attach: 0.5,
    hangOffset: 0,
    beads: null
  },
  {
    slug: "ghanta",
    name: "Ghanta",
    origin: "India",
    description: "A bell rung to clear the air and mark a beginning. Ring it when you make a wish, or before something that matters.",
    ritual: { kind: "ghanta", label: "Ring the bell" },
    art: { type: "image", src: "../assets/charms/ghanta.png", frame: [64, 84] },
    attach: 0.073,
    hangOffset: 35.9,
    cordEnd: { kind: "tip", from: [32, 5.6], to: [32, 12.6] },
    beads: { small: "glass:gold", big: "glass:lacquerRed", raise: 0, bigSize: 12 }
  },
  {
    slug: "drishti-bommai",
    name: "Drishti bommai",
    origin: "South India",
    description: "A fierce guardian painted to meet the first bad glance. Repaint it through seven colors whenever you want a fresh start.",
    ritual: { kind: "drishti", label: "Repaint the guardian" },
    art: { type: "image", src: "../assets/charms/drishti-bommai.png", frame: [64, 84] },
    attach: 0.13,
    hangOffset: 31.1,
    beads: { small: "glass:gold", big: "striped", raise: 4, bigSize: 12 }
  },
  {
    slug: "chinese-knot",
    name: "Páncháng jié",
    origin: "China",
    description: "One unbroken red cord tied for good fortune without end. Cinch it gently and let the tassel settle.",
    ritual: { kind: "knot", label: "Tie in good fortune" },
    art: { type: "image", src: "../assets/charms/chinese-knot.png", frame: [64, 84] },
    attach: 0.045,
    hangOffset: 38.2,
    cordEnd: { kind: "binding", center: [32, 4.3] },
    beads: { small: "glass:lacquerRed", big: "glass:gold", raise: 0, bigSize: 12 }
  },
  {
    slug: "daruma",
    name: "Daruma",
    origin: "Japan",
    description: "A wishing doll for goals that take some grit. Paint one eye when you make a wish and the other when it comes true.",
    ritual: { kind: "daruma", label: "Make a wish" },
    art: { type: "image", src: "../assets/charms/daruma.png", frame: [64, 64] },
    attach: 0.14,
    hangOffset: 23,
    beads: { small: "glass:gold", big: "glass:white", raise: 0, bigSize: 12 }
  },
  {
    slug: "maneki-neko",
    name: "Maneki-neko",
    origin: "Japan",
    description: "A beckoning cat that invites good fortune in. Call on it and watch its raised paw wave.",
    ritual: { kind: "maneki", label: "Beckon good fortune" },
    art: {
      type: "compound",
      body: "../assets/charms/maneki-body.png",
      arm: "../assets/charms/maneki-arm.png",
      fallback: "../assets/charms/maneki-neko.png",
      frame: [64, 84],
      pivot: [0.38, 0.44]
    },
    attach: 0.13,
    hangOffset: 31.1,
    beads: { small: "glass:gold", big: "glass:lacquerRed", raise: 4, bigSize: 12 }
  },
  {
    slug: "horseshoe",
    name: "Horseshoe",
    origin: "Europe and the Americas",
    description: "Hung points up so the luck stays put. A good flick is all this one needs.",
    ritual: { kind: "flick", label: "Give it a flick" },
    art: { type: "image", src: "../assets/charms/horseshoe.png", frame: [64, 84] },
    attach: 0.12,
    hangOffset: 31.9,
    cordEnd: { kind: "tip", from: [32.2, 9.7], to: [32.2, 14.3] },
    beads: { small: "hexnut", big: "horsehead", raise: 0, bigSize: 20 }
  },
  {
    slug: "scarab",
    name: "Scarab",
    origin: "Ancient Egypt",
    description: "An ancient amulet for renewal and new beginnings. Spread its ceremonial wings for a moment, then let them rest.",
    ritual: { kind: "scarab", label: "Spread the wings" },
    art: {
      type: "compound",
      body: "../assets/charms/scarab.png",
      wings: "../assets/charms/scarab-wings.png",
      frame: [140.5, 107]
    },
    attach: 0.184,
    hangOffset: 33.8,
    cordEnd: { kind: "tip", from: [70.25, 19.2], to: [70.25, 25] },
    beads: { small: "glass:gold", big: "glass:faience", raise: 4, bigSize: 12 }
  },
  {
    slug: "himmeli",
    name: "Himmeli",
    origin: "Finland",
    description: "A rye-straw tradition for inviting abundance, prosperity, and a fruitful flow of work. Set its open geometry turning on an imagined current of air.",
    ritual: { kind: "himmeli", label: "Set it turning" },
    art: { type: "image", src: "../assets/charms/himmeli.png", frame: [64, 84] },
    attach: 0.05,
    hangOffset: 37.8,
    beads: null
  },
  {
    slug: "custom",
    name: "Emoji",
    origin: "Yours",
    description: "Choose any emoji and make the ritual your own. Hang the one that feels lucky to you.",
    ritual: { kind: "emoji", label: "Pick an emoji" },
    art: { type: "emoji", glyph: "🍀", frame: [64, 64], fontSize: 58 },
    attach: 0.15,
    hangOffset: 22.4,
    beads: { small: "glass:white", big: "emojiTwin", raise: 0, bigSize: 14 }
  },
  {
    slug: "custom-image",
    name: "Custom Image",
    origin: "Your Device",
    description: "Your own uploaded image hanging with lucky beads. Choose any photo or art you love.",
    ritual: { kind: "flick", label: "Give it a flick" },
    art: { type: "image", src: "", frame: [64, 84] },
    attach: 0.03,
    hangOffset: 28,
    beads: { small: "glass:gold", big: "glass:deepBlue", raise: 0, bigSize: 12 }
  }
];

// 7 sacred colors for Drishti Bommai
const DRISHTI_COLORS = [
  "../assets/charms/drishti-bommai.png",
  "../assets/charms/drishti-blue.png",
  "../assets/charms/drishti-green.png",
  "../assets/charms/drishti-orange.png",
  "../assets/charms/drishti-purple.png",
  "../assets/charms/drishti-yellow.png",
  "../assets/charms/drishti-black.png"
];

// Nimbu-mirchi garland composition configuration
const GARLAND_CONFIG = {
  slots: [0.52, 0.58, 0.63, 0.68, 0.73, 0.78, 0.83],
  slotSprite: [1, 4, 2, 6, 0, 3, 5], // 0-indexed indices for nimbu-chili-(1..7).png
  slotJitter: [0.08, -0.12, 0.05, -0.08, 0.13, -0.05, 0.1],
  chiliSizes: [
    [65.2, 16.2],
    [66.0, 8.2],
    [55.6, 11.3],
    [57.8, 12.1],
    [42.3, 11.3],
    [56.8, 10.1],
    [59.1, 9.0]
  ],
  lemon: [44, 48.6],
  coal: [21, 18.8]
};

// SVG Definitions for Cord, Beads, Gradients and Lighting
function getSvgDefs() {
  return `
    <linearGradient id="dg-rope" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#735028"/>
      <stop offset="35%" stop-color="#b88a44"/>
      <stop offset="65%" stop-color="#e2bf7d"/>
      <stop offset="100%" stop-color="#6e4c25"/>
    </linearGradient>

    <!-- Glass Beads: White -->
    <radialGradient id="dg-g-white" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#ebebf0"/>
      <stop offset="100%" stop-color="#9ea1ad"/>
    </radialGradient>
    <radialGradient id="dg-rim-white" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.4)"/>
    </radialGradient>

    <!-- Glass Beads: Gold -->
    <radialGradient id="dg-g-gold" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffe685"/>
      <stop offset="60%" stop-color="#edb52e"/>
      <stop offset="100%" stop-color="#9e6b0a"/>
    </radialGradient>
    <radialGradient id="dg-rim-gold" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(255,217,102,0.5)"/>
    </radialGradient>

    <!-- Glass Beads: Deep Blue -->
    <radialGradient id="dg-g-deepBlue" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#6b8ce0"/>
      <stop offset="60%" stop-color="#294294"/>
      <stop offset="100%" stop-color="#0a1447"/>
    </radialGradient>
    <radialGradient id="dg-rim-deepBlue" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(128,166,255,0.5)"/>
    </radialGradient>

    <!-- Glass Beads: Lacquer Red -->
    <radialGradient id="dg-g-lacquerRed" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ff7a66"/>
      <stop offset="60%" stop-color="#d4211a"/>
      <stop offset="100%" stop-color="#6b050a"/>
    </radialGradient>
    <radialGradient id="dg-rim-lacquerRed" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(255,115,89,0.5)"/>
    </radialGradient>

    <!-- Glass Beads: Faience (Scarab turquoise) -->
    <radialGradient id="dg-g-faience" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#9ef0e3"/>
      <stop offset="60%" stop-color="#29a69e"/>
      <stop offset="100%" stop-color="#084f54"/>
    </radialGradient>
    <radialGradient id="dg-rim-faience" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(140,242,230,0.5)"/>
    </radialGradient>

    <!-- Nazar Eye Bead -->
    <radialGradient id="dg-g-eyeBlue" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#3b72e8"/>
      <stop offset="65%" stop-color="#143c96"/>
      <stop offset="100%" stop-color="#0a1b42"/>
    </radialGradient>
    <radialGradient id="dg-rim-eyeBlue" cx="50%" cy="50%" r="50%">
      <stop offset="85%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(100,160,255,0.4)"/>
    </radialGradient>

    <!-- Hex Nut Metal Bead -->
    <linearGradient id="dg-hex" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0e0eb"/>
      <stop offset="45%" stop-color="#8c8c99"/>
      <stop offset="70%" stop-color="#4d4d59"/>
      <stop offset="100%" stop-color="#26262e"/>
    </linearGradient>

    <!-- Vector charm materials -->
    <linearGradient id="ld-brass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5d27a"/>
      <stop offset="50%" stop-color="#c8902a"/>
      <stop offset="100%" stop-color="#7a4a12"/>
    </linearGradient>
    <linearGradient id="ld-gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a87515"/>
      <stop offset="45%" stop-color="#fff0a8"/>
      <stop offset="60%" stop-color="#e8b33a"/>
      <stop offset="100%" stop-color="#8a5a0c"/>
    </linearGradient>
    <radialGradient id="ld-flameglow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,200,90,0.75)"/>
      <stop offset="100%" stop-color="rgba(255,160,40,0)"/>
    </radialGradient>
    <radialGradient id="ld-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,230,130,0.95)"/>
      <stop offset="100%" stop-color="rgba(255,200,60,0)"/>
    </radialGradient>

    <filter id="dg-tipshadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="0.6" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  `;
}

function renderBead(beadType, radius, emojiGlyph = "🍀") {
  if (beadType.startsWith("glass:")) {
    const colorKey = beadType.split(":")[1];
    const r = radius;
    const hx = -r * 0.34;
    const hy = -r * 0.46;
    const rx = r * 0.27;
    const ry = r * 0.2;
    return `
      <circle r="${r}" fill="url(#dg-g-${colorKey})"/>
      <circle r="${r}" fill="url(#dg-rim-${colorKey})"/>
      <ellipse cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="rgba(255,255,255,0.85)"/>
    `;
  }
  if (beadType === "eye") {
    const r = radius;
    return `
      <circle r="${r}" fill="url(#dg-g-eyeBlue)"/>
      <circle r="${(r * 0.55).toFixed(2)}" fill="#ffffff"/>
      <circle r="${(r * 0.35).toFixed(2)}" fill="#73ccfa"/>
      <circle r="${(r * 0.16).toFixed(2)}" fill="#0d0d1a"/>
      <circle r="${r}" fill="url(#dg-rim-eyeBlue)"/>
      <ellipse cx="${(-r * 0.52).toFixed(2)}" cy="${(-r * 0.6).toFixed(2)}" rx="${(r * 0.22).toFixed(2)}" ry="${(r * 0.15).toFixed(2)}" transform="rotate(-30 ${(-r * 0.52).toFixed(2)} ${(-r * 0.6).toFixed(2)})" fill="rgba(255,255,255,0.75)"/>
    `;
  }
  if (beadType === "striped") {
    const r = radius;
    return `
      <circle r="${r}" fill="url(#dg-g-lacquerRed)"/>
      <circle r="${r}" fill="url(#dg-rim-lacquerRed)"/>
      <ellipse cx="${(-r * 0.34).toFixed(2)}" cy="${(-r * 0.46).toFixed(2)}" rx="${(r * 0.27).toFixed(2)}" ry="${(r * 0.2).toFixed(2)}" fill="rgba(255,255,255,0.85)"/>
      <path d="M ${(-r * 0.8).toFixed(2)} ${(-r * 0.2).toFixed(2)} Q 0 ${(r * 0.04).toFixed(2)} ${(r * 0.8).toFixed(2)} ${(-r * 0.2).toFixed(2)}" stroke="rgba(245,194,41,0.85)" stroke-width="1.3" stroke-linecap="round" fill="none"/>
      <path d="M ${(-r * 0.72).toFixed(2)} ${(r * 0.24).toFixed(2)} Q 0 ${(r * 0.52).toFixed(2)} ${(r * 0.72).toFixed(2)} ${(r * 0.24).toFixed(2)}" stroke="rgba(245,194,41,0.75)" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    `;
  }
  if (beadType === "hexnut") {
    return `
      <polygon points="3.03,-1.75 0,-3.5 -3.03,-1.75 -3.03,1.75 0,3.5 3.03,1.75" fill="url(#dg-hex)"/>
      <circle r="1.33" fill="#1a1a1f"/>
    `;
  }
  if (beadType === "horsehead") {
    return `<image href="../assets/charms/horse-head-bead.png" x="-10" y="-10" width="20" height="20"/>`;
  }
  if (beadType === "emojiTwin") {
    return `<text text-anchor="middle" dominant-baseline="central" font-size="${radius * 1.8}">${emojiGlyph}</text>`;
  }
  return "";
}

// Export for CommonJS and browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CHARMS,
    DRISHTI_COLORS,
    GARLAND_CONFIG,
    getSvgDefs,
    renderBead
  };
}
