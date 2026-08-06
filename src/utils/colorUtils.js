const NAMED_COLORS = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  magenta: [255, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  silver: [192, 192, 192],
  maroon: [128, 0, 0],
  olive: [128, 128, 0],
  lime: [0, 255, 0],
  aqua: [0, 255, 255],
  teal: [0, 128, 128],
  navy: [0, 0, 128],
  fuchsia: [255, 0, 255],
  purple: [128, 0, 128],
  orange: [255, 165, 0],
  pink: [255, 192, 203],
  brown: [165, 42, 42],
  coral: [255, 127, 80],
  gold: [255, 215, 0],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  linen: [250, 240, 230],
  plum: [221, 160, 221],
  salmon: [250, 128, 114],
  sienna: [160, 82, 45],
  tan: [210, 180, 140],
  tomato: [255, 99, 71],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  snow: [255, 250, 250],
  honeydew: [240, 255, 240],
  mintcream: [245, 255, 250],
  azure: [240, 255, 255],
  aliceblue: [240, 248, 255],
  ghostwhite: [248, 248, 255],
  whitesmoke: [245, 245, 245],
  gainsboro: [220, 220, 220],
  darkgray: [169, 169, 169],
  darkgrey: [169, 169, 169],
  lightgray: [211, 211, 211],
  lightgrey: [211, 211, 211],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkred: [139, 0, 0],
  darkgreen: [0, 100, 0],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkmagenta: [139, 0, 139],
  darkorange: [255, 140, 0],
  darkgoldenrod: [184, 134, 11],
  darkkhaki: [189, 183, 107],
  darkolivegreen: [85, 107, 47],
  darkorchid: [153, 50, 204],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  forestgreen: [34, 139, 34],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgreen: [144, 238, 144],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightsteelblue: [176, 196, 222],
  limegreen: [50, 205, 50],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  oldlace: [253, 245, 230],
  olivedrab: [107, 142, 35],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  turquoise: [64, 224, 208],
  yellowgreen: [154, 205, 50],
};

function parseRgb(color) {
  const match = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
  );
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return null;
}

function parseHsl(color) {
  const match = color.match(
    /hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/
  );
  if (match) {
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    if (s === 0) {
      const v = Math.round(l * 255);
      return [v, v, v];
    }

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return [
      Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    ];
  }
  return null;
}

function toRgb(color) {
  if (!color || typeof color !== "string") return null;

  const trimmed = color.trim().toLowerCase();

  if (trimmed === "transparent") return null;

  if (NAMED_COLORS[trimmed]) return NAMED_COLORS[trimmed];

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    if (hex.length === 6 || hex.length === 8) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  }

  if (trimmed.startsWith("rgb")) return parseRgb(trimmed);
  if (trimmed.startsWith("hsl")) return parseHsl(trimmed);

  return null;
}

export function isTransparentOrMissing(color) {
  if (!color || typeof color !== "string") return true;
  const t = color.trim().toLowerCase();
  return (
    !t ||
    t === "transparent" ||
    t === "rgba(0,0,0,0)" ||
    t === "rgba(0, 0, 0, 0)" ||
    t === "hsla(0,0%,0%,0)" ||
    t === "hsla(0, 0%, 0%, 0)"
  );
}

export function isLightColor(color) {
  const rgb = toRgb(color);
  if (!rgb) return true;
  const [r, g, b] = rgb;
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
