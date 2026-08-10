import { isLightColor, isTransparentOrMissing } from "./colorUtils";

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const LIGHT_BG = "#ffffff";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";

const VALID_GAPS = ["4px", "8px", "12px", "16px", "24px", "32px"];
const VALID_RADIUS = ["8px", "12px", "16px", "9999px"];
const VALID_SHADOWS = [
  "none",
  "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
  "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
];

function cloneTree(node) {
  if (!node || typeof node !== "object") return node;
  return {
    ...node,
    props: { ...(node.props ?? {}) },
    styles: { ...(node.styles ?? {}) },
    children: (node.children ?? []).map(cloneTree),
  };
}

function ensureContrast(node, parentBg) {
  if (!node) return;

  const styles = node.styles ?? {};
  const ownBg = styles.backgroundColor;
  const currentBg = !isTransparentOrMissing(ownBg) ? ownBg : parentBg;

  if (node.type === "text" || node.type === "heading") {
    const textColor = styles.color;
    if (isTransparentOrMissing(textColor)) {
      node.styles = {
        ...styles,
        color: isLightColor(currentBg) ? LIGHT_TEXT : DARK_TEXT,
      };
    } else {
      const isSafe = isLightColor(currentBg)
        ? !isLightColor(textColor)
        : isLightColor(textColor);
      if (!isSafe) {
        node.styles = {
          ...styles,
          color: isLightColor(currentBg) ? LIGHT_TEXT : DARK_TEXT,
        };
      }
    }
  }

  for (const child of node.children ?? []) {
    ensureContrast(child, currentBg);
  }
}

function ensureFont(node) {
  if (!node) return;
  const styles = node.styles ?? {};
  if (!styles.fontFamily) {
    node.styles = { ...styles, fontFamily: SYSTEM_FONT };
  }
  for (const child of node.children ?? []) {
    ensureFont(child);
  }
}

function parsePx(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  return match ? parseFloat(match[1]) : null;
}

function ensureContainerWidth(node) {
  if (!node) return;

  const styles = node.styles ?? {};

  if (styles.maxWidth) {
    const px = parsePx(styles.maxWidth);
    if (px && px > 1200) {
      node.styles = { ...styles, maxWidth: "1200px" };
    }
  }

  for (const child of node.children ?? []) {
    ensureContainerWidth(child);
  }
}

function ensureSectionSpacing(node, depth) {
  if (!node) return;

  const styles = node.styles ?? {};
  const isSectionLike =
    node.type === "container" &&
    depth <= 2 &&
    (styles.paddingTop || styles.paddingBottom || styles.padding);

  if (isSectionLike) {
    const newStyles = { ...styles };

    if (newStyles.paddingTop) {
      const px = parsePx(newStyles.paddingTop);
      if (px && px < 48) {
        newStyles.paddingTop = "64px";
      }
    }

    if (newStyles.paddingBottom) {
      const px = parsePx(newStyles.paddingBottom);
      if (px && px < 48) {
        newStyles.paddingBottom = "64px";
      }
    }

    if (newStyles.gap) {
      if (!VALID_GAPS.includes(newStyles.gap)) {
        const px = parsePx(newStyles.gap);
        if (px && px < 4) {
          newStyles.gap = "16px";
        }
      }
    }

    node.styles = newStyles;
  }

  for (const child of node.children ?? []) {
    ensureSectionSpacing(child, depth + 1);
  }
}

function ensureCardPadding(node) {
  if (!node) return;

  const styles = node.styles ?? {};

  if (node.type === "card") {
    const newStyles = { ...styles };
    if (newStyles.padding) {
      const px = parsePx(newStyles.padding);
      if (px && px < 16) {
        newStyles.padding = "24px";
      }
    }
    node.styles = newStyles;
  }

  for (const child of node.children ?? []) {
    ensureCardPadding(child);
  }
}

function ensureRadius(node) {
  if (!node) return;

  const styles = node.styles ?? {};

  if (styles.borderRadius && !VALID_RADIUS.includes(styles.borderRadius)) {
    const px = parsePx(styles.borderRadius);
    if (px !== null) {
      if (px < 4) {
        node.styles = { ...styles, borderRadius: "8px" };
      } else if (px > 24) {
        node.styles = { ...styles, borderRadius: "16px" };
      }
    }
  }

  for (const child of node.children ?? []) {
    ensureRadius(child);
  }
}

function ensureShadow(node) {
  if (!node) return;

  const styles = node.styles ?? {};

  if (
    styles.boxShadow &&
    styles.boxShadow !== "none" &&
    !VALID_SHADOWS.includes(styles.boxShadow)
  ) {
    node.styles = {
      ...styles,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
    };
  }

  for (const child of node.children ?? []) {
    ensureShadow(child);
  }
}

function ensureButtonSize(node) {
  if (!node) return;

  if (node.type === "button") {
    const styles = node.styles ?? {};
    const newStyles = { ...styles };

    if (!newStyles.minHeight) {
      newStyles.minHeight = "44px";
    }

    if (!newStyles.padding) {
      newStyles.padding = "12px 24px";
    }

    node.styles = newStyles;
  }

  for (const child of node.children ?? []) {
    ensureButtonSize(child);
  }
}

function ensureGridContainer(node) {
  if (!node || typeof node !== "object") return;

  const styles = node.styles ?? {};
  const children = node.children ?? [];

  if (
    node.type === "container" &&
    children.length >= 2 &&
    children.length <= 6 &&
    !styles.display &&
    children.some(c => c.type === "card" || c.type === "container")
  ) {
    const newStyles = { ...styles };
    newStyles.display = "grid";
    newStyles.gridTemplateColumns = `repeat(${Math.min(children.length, 3)}, 1fr)`;
    if (!newStyles.gap) newStyles.gap = "24px";
    if (!newStyles.padding) newStyles.padding = "64px 32px";
    node.styles = newStyles;
  }

  for (const child of children) {
    ensureGridContainer(child);
  }
}

export function completionPass(tree) {
  if (!tree || typeof tree !== "object") return tree;

  const root = cloneTree(tree);
  const rootStyles = { ...(root.styles ?? {}) };

  if (isTransparentOrMissing(rootStyles.backgroundColor)) {
    rootStyles.backgroundColor = LIGHT_BG;
  }

  if (!rootStyles.minHeight) {
    rootStyles.minHeight = "100vh";
  }

  if (!rootStyles.display) {
    rootStyles.display = "flex";
  }

  if (!rootStyles.flexDirection) {
    rootStyles.flexDirection = "column";
  }

  if (!rootStyles.color) {
    rootStyles.color = isLightColor(rootStyles.backgroundColor)
      ? LIGHT_TEXT
      : DARK_TEXT;
  }

  if (!rootStyles.fontFamily) {
    rootStyles.fontFamily = SYSTEM_FONT;
  }

  root.styles = rootStyles;

  root.children = (root.children ?? []).map((child) => {
    const patched = { ...child };
    ensureContrast(patched, rootStyles.backgroundColor);
    ensureFont(patched);
    return patched;
  });

  ensureContainerWidth(root);
  ensureGridContainer(root);
  ensureSectionSpacing(root, 0);
  ensureCardPadding(root);
  ensureRadius(root);
  ensureShadow(root);
  ensureButtonSize(root);

  return root;
}
