const DARK_KEYWORDS = ["dark", "dark mode", "modern", "premium", "sleek", "glass", "glassmorphism", "gradient", "neon", "glow", "saas", "tech", "startup", "ai", "futuristic", "bento"];

function wantsDarkTheme(prompt) {
  if (!prompt) return false;
  const lower = prompt.toLowerCase();
  return DARK_KEYWORDS.some((kw) => {
    const pattern = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return pattern.test(lower);
  });
}

const SECTION_BLUEPRINTS_LIGHT = {
  footer: {
    goal: "A clean footer with brand, navigation links, and copyright",
    mustInclude: [
      "brand name (heading, 18px, bold)",
      "navigation link columns (2-3 columns of text links)",
      "copyright text (14px, muted color)",
    ],
    style: "background #0f172a, text #cbd5e1, light text on dark footer",
    layout: "3-column grid or flex row, maxWidth 1200px margin auto, padding 64px 32px",
  },
  navbar: {
    goal: "A clean navigation bar with brand, links, and CTA",
    mustInclude: [
      "brand name (heading, 18-20px, bold)",
      "navigation links (2-5 text links)",
      "CTA button (accent color)",
    ],
    style: "background matching page, subtle bottom border, text #0f172a",
    layout: "flex row, justify between, align center, padding 16px 32px",
  },
  hero: {
    goal: "A compelling hero section with headline, subtitle, and CTA",
    mustInclude: [
      "headline (56px desktop / 36px mobile, bold)",
      "subtitle (20px, regular weight, color #475569)",
      "primary CTA button (accent color)",
    ],
    style: "clean white or light gray background, strong visual hierarchy, centered text",
    layout: "flex column, align center, text center, padding 96px 32px",
  },
  features: {
    goal: "Feature showcase section with cards",
    mustInclude: [
      "section heading (36px, bold, centered)",
      "section description (18px, centered, color #475569)",
      "3-4 feature cards with heading and description",
    ],
    style: "white or light gray background, cards white with subtle shadow",
    layout: "grid 3 columns desktop, 1 column mobile, maxWidth 1200px",
  },
  pricing: {
    goal: "Pricing comparison section with tier cards",
    mustInclude: [
      "section heading (36px, bold, centered)",
      "2-3 pricing cards with plan name, price, feature list, CTA",
      "featured card slightly elevated with accent border",
    ],
    style: "light background, cards white, featured card accent border",
    layout: "grid 3 columns desktop, 1 column mobile",
  },
  testimonials: {
    goal: "Social proof section with client quotes",
    mustInclude: [
      "section heading (36px, bold, centered)",
      "2-3 testimonial cards with quote, author name, role",
    ],
    style: "light background, cards white with border",
    layout: "grid 3 columns desktop, 1 column mobile",
  },
  cta: {
    goal: "Call-to-action section to drive conversion",
    mustInclude: [
      "headline (36-40px, bold)",
      "supporting text (18px, color #475569)",
      "primary CTA button (accent color)",
    ],
    style: "accent tinted light background, centered text",
    layout: "flex column, align center, text center, padding 96px 32px",
  },
  contact: {
    goal: "Contact section with form or info",
    mustInclude: [
      "section heading (36px, bold)",
      "contact form (name, email, message, submit) or contact info",
    ],
    style: "light background, clean form inputs, accent button",
    layout: "2-column or single column, maxWidth 800px, padding 64px 32px",
  },
  about: {
    goal: "About section telling the brand story",
    mustInclude: [
      "section heading (36px, bold)",
      "2-3 paragraphs of body text (color #475569)",
      "optional image placeholder or stats row",
    ],
    style: "light background, clean typography",
    layout: "2-column or single column, maxWidth 1200px, padding 64px 32px",
  },
  services: {
    goal: "Services section showcasing offerings",
    mustInclude: [
      "section heading (36px, bold, centered)",
      "3-4 service cards with heading and description",
    ],
    style: "light background, cards white with subtle border",
    layout: "grid 3 columns desktop, 1 column mobile",
  },
  projects: {
    goal: "Portfolio or work showcase section",
    mustInclude: [
      "section heading (36px, bold, centered)",
      "3-4 project cards with placeholder, title, category",
    ],
    style: "light background, cards white with border or shadow",
    layout: "grid 2-3 columns desktop, 1 column mobile",
  },
  faq: {
    goal: "Frequently asked questions section",
    mustInclude: [
      "section heading (36px, bold, centered)",
      "4-6 FAQ items with question and answer",
    ],
    style: "light background, items with bottom border",
    layout: "single column, maxWidth 800px centered",
  },
};

const SECTION_BLUEPRINTS_DARK = {
  footer: {
    goal: "A modern minimal footer with brand, links, and copyright on dark background",
    mustInclude: [
      "brand name (heading, 18px, bold, white)",
      "navigation link columns (2-3 columns of text links, muted color)",
      "copyright text (14px, very muted color)",
    ],
    style: "background #09090b, text #a1a1aa, border-top 1px solid rgba(255,255,255,0.06)",
    layout: "flex row justify-between or 3-column grid, maxWidth 1200px margin auto, padding 64px 32px",
  },
  navbar: {
    goal: "A modern glassmorphism navigation bar with brand, links, and CTA",
    mustInclude: [
      "brand name or logo (heading, 18-20px, bold, white)",
      "navigation links (2-5 text links, muted color)",
      "CTA button (accent color, borderRadius 12px)",
    ],
    style: "background rgba(9,9,11,0.8), backdrop-filter blur(12px), border-bottom 1px solid rgba(255,255,255,0.06)",
    layout: "flex row, justify between, align center, padding 16px 32px",
  },
  hero: {
    goal: "A stunning modern hero with large typography, gradient background, and CTA",
    mustInclude: [
      "headline (72px desktop / 40px mobile, fontWeight 800, white)",
      "subtitle (20px, color #a1a1aa, maxWidth 600px)",
      "primary CTA button (accent color, borderRadius 12px)",
    ],
    style: "background radial-gradient(rgba(99,102,241,0.15) at 50% 0%, transparent 50%), #09090b, centered text",
    layout: "flex column, align center, text center, padding 128px 32px",
  },
  features: {
    goal: "Modern feature showcase using bento grid or glass cards",
    mustInclude: [
      "section heading (48px, fontWeight 700, white)",
      "section description (18px, color #a1a1aa)",
      "3-4 feature cards with heading (24px, white) and description (16px, #a1a1aa)",
    ],
    style: "background #09090b, cards background rgba(255,255,255,0.05), backdrop-filter blur(12px), border 1px solid rgba(255,255,255,0.08), borderRadius 20px",
    layout: "bento grid or 3-column grid, gap 16px, maxWidth 1200px",
  },
  pricing: {
    goal: "Modern pricing comparison with glass cards and accent glow",
    mustInclude: [
      "section heading (48px, fontWeight 700, white)",
      "2-3 pricing cards with plan name, price, features, CTA",
      "featured card with accent border or glow",
    ],
    style: "background #09090b, cards background rgba(255,255,255,0.05), border 1px solid rgba(255,255,255,0.08), borderRadius 20px",
    layout: "grid 3 columns desktop, 1 column mobile, gap 24px",
  },
  testimonials: {
    goal: "Social proof with glass cards and clean quotes",
    mustInclude: [
      "section heading (48px, fontWeight 700, white)",
      "2-3 testimonial cards with quote, author, role",
    ],
    style: "background #09090b, cards rgba(255,255,255,0.05), border rgba(255,255,255,0.08), borderRadius 16px",
    layout: "grid 3 columns desktop, 1 column mobile",
  },
  cta: {
    goal: "Modern call-to-action with gradient background",
    mustInclude: [
      "headline (48px, fontWeight 700, white)",
      "supporting text (18px, #a1a1aa)",
      "primary CTA button (accent color, borderRadius 12px)",
    ],
    style: "background linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1)), border 1px solid rgba(255,255,255,0.06), borderRadius 24px",
    layout: "flex column, align center, text center, maxWidth 700px, padding 96px 32px",
  },
  contact: {
    goal: "Modern contact section with glass form",
    mustInclude: [
      "section heading (48px, fontWeight 700, white)",
      "contact form with modern inputs or contact info cards",
    ],
    style: "background #09090b, inputs rgba(255,255,255,0.05), border rgba(255,255,255,0.1), borderRadius 12px",
    layout: "2-column or single column, maxWidth 800px, padding 96px 32px",
  },
  about: {
    goal: "Modern about section with clean typography and stats",
    mustInclude: [
      "section heading (48px, fontWeight 700, white)",
      "2-3 paragraphs (16px, #a1a1aa)",
      "optional stats row with accent color numbers",
    ],
    style: "background #09090b, clean typography",
    layout: "2-column or single column, maxWidth 1200px, padding 96px 32px",
  },
  services: {
    goal: "Modern services showcase with glass cards",
    mustInclude: [
      "section heading (48px, fontWeight 700, white)",
      "3-4 service cards with heading and description",
    ],
    style: "background #09090b, cards rgba(255,255,255,0.05), border rgba(255,255,255,0.08), borderRadius 20px",
    layout: "grid 3 columns desktop, 1 column mobile",
  },
  projects: {
    goal: "Modern portfolio grid with glass cards",
    mustInclude: [
      "section heading (48px, fontWeight 700, white)",
      "3-4 project cards with placeholder, title, category",
    ],
    style: "background #09090b, cards rgba(255,255,255,0.05), border rgba(255,255,255,0.08), borderRadius 16px",
    layout: "bento or 2-3 column grid, maxWidth 1200px",
  },
  faq: {
    goal: "Modern FAQ with clean items",
    mustInclude: [
      "section heading (48px, fontWeight 700, white)",
      "4-6 FAQ items with question and answer",
    ],
    style: "background #09090b, items border-bottom 1px solid rgba(255,255,255,0.06)",
    layout: "single column, maxWidth 800px centered",
  },
};

function getBlueprints(prompt) {
  return wantsDarkTheme(prompt) ? SECTION_BLUEPRINTS_DARK : SECTION_BLUEPRINTS_LIGHT;
}

const EDIT_INTENTS_LIGHT = {
  "make it modern": {
    intent: "Redesign with modern SaaS design principles",
    guidance: "Clean lines, ample whitespace, refined typography, subtle shadows, professional color palette, better spacing and hierarchy",
  },
  "make it beautiful": {
    intent: "Improve visual design quality",
    guidance: "Better spacing, stronger hierarchy, refined colors, consistent rhythm",
  },
  "make it professional": {
    intent: "Apply professional design standards",
    guidance: "Consistent spacing, refined typography, cohesive palette, balanced layout",
  },
  "make it clean": {
    intent: "Simplify and declutter",
    guidance: "Remove noise, increase whitespace, simplify colors, clear hierarchy",
  },
  "improve it": {
    intent: "Enhance overall design quality",
    guidance: "Spacing, typography, colors, hierarchy, consistency",
  },
  "fix the design": {
    intent: "Repair design inconsistencies",
    guidance: "Alignment, spacing, typography, component consistency",
  },
};

const EDIT_INTENTS_DARK = {
  "make it modern": {
    intent: "Redesign using 2024-2025 modern dark web design",
    guidance: "Dark mode (#09090b bg), glassmorphism cards (backdrop-blur, rgba), generous spacing (96px sections), large bold typography (48-72px headings), accent gradients, borderRadius 16-20px",
  },
  "make it beautiful": {
    intent: "Transform into a visually stunning dark modern website",
    guidance: "Dark backgrounds, glass cards with blur, gradient accents, bold typography hierarchy, generous whitespace",
  },
  "make it professional": {
    intent: "Apply enterprise-grade dark design",
    guidance: "Clean dark theme, consistent spacing, refined typography, cohesive accent color, subtle borders",
  },
  "make it clean": {
    intent: "Simplify to modern dark minimalism",
    guidance: "Dark background, generous whitespace, minimal borders, clear hierarchy, single accent color",
  },
  "improve it": {
    intent: "Enhance to modern dark design quality",
    guidance: "Increase spacing, larger headings, glass card effects, dark theme consistency",
  },
  "fix the design": {
    intent: "Repair and modernize design",
    guidance: "Fix alignment, increase spacing, consistent dark theme, proper typography scale",
  },
};

function getEditIntents(prompt) {
  return wantsDarkTheme(prompt) ? EDIT_INTENTS_DARK : EDIT_INTENTS_LIGHT;
}

function analyzeSectionIntent(prompt) {
  const lower = prompt.toLowerCase();
  const blueprints = getBlueprints(prompt);

  for (const [section, blueprint] of Object.entries(blueprints)) {
    if (lower.includes(section)) {
      return { type: "section", section, blueprint };
    }
  }

  const sectionKeywords = {
    hero: ["landing", "banner", "top section", "above the fold"],
    footer: ["bottom", "closing"],
    features: ["capabilities", "what we offer", "product features"],
    pricing: ["plans", "tiers", "cost", "subscription"],
    testimonials: ["reviews", "quotes", "feedback", "clients say"],
    contact: ["reach us", "get in touch", "email us"],
    faq: ["questions", "help", "support"],
    about: ["who we are", "our story", "team"],
    services: ["what we do", "offerings"],
    projects: ["portfolio", "work", "case studies"],
  };

  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { type: "section", section, blueprint: blueprints[section] };
    }
  }

  return null;
}

function analyzeEditIntent(prompt) {
  const lower = prompt.toLowerCase();
  const intents = getEditIntents(prompt);
  for (const [phrase, editInfo] of Object.entries(intents)) {
    if (lower.includes(phrase)) {
      return editInfo;
    }
  }
  return null;
}

function analyzeStyleChange(prompt) {
  const lower = prompt.toLowerCase();
  const patterns = [
    { match: /\b(red|blue|green|purple|orange|pink|yellow|teal|cyan|indigo|violet|emerald|slate)\b/i, type: "color" },
    { match: /\b(dark|light)\s*(mode|theme)\b/i, type: "theme" },
    { match: /\bgradient\b/i, type: "gradient" },
    { match: /\b(shadow|glow|blur)\b/i, type: "effect" },
    { match: /\b(rounded|sharp|circular)\b/i, type: "radius" },
    { match: /\b(big|small|larger|smaller|bigger)\b/i, type: "size" },
    { match: /\b(bold|italic|thin|light)\b/i, type: "typography" },
  ];
  const detected = [];
  for (const p of patterns) {
    if (p.match.test(lower)) detected.push(p.type);
  }
  return detected.length > 0 ? detected : null;
}

function countChildren(node) {
  if (!node || !node.children) return 0;
  let count = 0;
  for (const child of node.children) {
    count += 1;
    count += countChildren(child);
  }
  return count;
}

function getExistingSections(tree) {
  if (!tree || !tree.children) return [];
  return tree.children.map((child) => ({
    id: child.id,
    type: child.type,
    text: (child.props?.text || "").substring(0, 50),
    childCount: child.children?.length || 0,
  }));
}

export function enrichWithDesignIntent(prompt, intentRoute, context = {}) {
  const { componentTree } = context;
  const sectionAnalysis = analyzeSectionIntent(prompt);
  const editAnalysis = analyzeEditIntent(prompt);
  const styleAnalysis = analyzeStyleChange(prompt);
  const existingSections = componentTree ? getExistingSections(componentTree) : [];
  const treeSize = componentTree ? countChildren(componentTree) : 0;
  const isPageScope = context.scope === "page";
  const isDark = wantsDarkTheme(prompt);

  const enrichments = [];

  if (isDark) {
    enrichments.push("THEME: Dark mode — use dark backgrounds (#09090b), light text (#fafafa/#a1a1aa), glassmorphism cards");
  }

  if (sectionAnalysis && sectionAnalysis.blueprint) {
    const bp = sectionAnalysis.blueprint;
    enrichments.push(`DESIGN INTENT: The user wants to add a ${sectionAnalysis.section} section.`);
    enrichments.push(`GOAL: ${bp.goal}`);
    enrichments.push(`MUST INCLUDE: ${bp.mustInclude.join("; ")}`);
    enrichments.push(`STYLE: ${bp.style}`);
    enrichments.push(`LAYOUT: ${bp.layout}`);
  }

  if (editAnalysis) {
    enrichments.push(`DESIGN INTENT: ${editAnalysis.intent}`);
    enrichments.push(`DESIGN GUIDANCE: ${editAnalysis.guidance}`);
  }

  if (styleAnalysis) {
    enrichments.push(`STYLE FOCUS: ${styleAnalysis.join(", ")} changes requested`);
  }

  if (isPageScope && treeSize > 0) {
    enrichments.push(`EXISTING PAGE: ${treeSize} components. Top-level: [${existingSections.map((s) => s.type + "(" + s.childCount + " children)").join(", ")}].`);
    enrichments.push(`PRESERVE existing components. Only modify what the user asked for.`);
  }

  if (isPageScope && treeSize === 0) {
    enrichments.push(`EMPTY PAGE: Generate a complete website from scratch with navigation, hero, content sections, and footer.`);
  }

  if (enrichments.length === 0) return null;

  return enrichments.join("\n");
}
