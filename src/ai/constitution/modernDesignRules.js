export const modernDesignRules = `
MODERN DESIGN RULES (2024-2025) — MANDATORY FOR ALL GENERATIONS

Generate websites that look like Linear, Vercel, Framer, or Stripe. NOT 2015 templates.

DARK THEME DEFAULT:
- Page bg: #09090b or #0c0a09
- Cards: background rgba(255,255,255,0.05), backdrop-filter blur(12px), border 1px solid rgba(255,255,255,0.08)
- Headings: #fafafa, Body: #a1a1aa, Muted: #71717a
- Borders: rgba(255,255,255,0.06)

TYPOGRAPHY (Large, Bold, Tight):
- Font: "Inter", system-ui, sans-serif
- Hero: 72px/40px mobile, fontWeight 800, letterSpacing -0.03em
- Section: 48px/32px mobile, fontWeight 700, letterSpacing -0.02em
- Card title: 24px, Body: 16px/#a1a1aa, Label: 12px uppercase letter-spacing 0.05em

SPACING (Generous):
- Hero padding: 128px 32px (mobile: 80px 20px)
- Section padding: 96px 32px
- Card padding: 32px, Gap: 16-24px

BORDER RADIUS: buttons 12px, cards 16-20px, inputs 12px, pills 9999px

GRADIENT ACCENTS:
- Hero bg: radial-gradient(rgba(99,102,241,0.15) at 50% 0%, transparent 50%), #09090b
- CTA bg: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))
- Buttons: use ONE accent color consistently (Blue #3b82f6, Purple #8b5cf6, Indigo #6366f1, or Emerald #10b981)

BENTO GRID: Asymmetric cards with mixed column spans (2fr 1fr / 1fr 1fr), gap 16px

BUTTONS: Primary (accent bg, white text, 12px radius), Ghost (transparent, #a1a1aa text)
INPUTS: bg rgba(255,255,255,0.05), border rgba(255,255,255,0.1), radius 12px

INTERACTIONS: transition all 200ms ease, hover translateY(-2px) or brightness(1.1)

AVOID: White page bg, small radius (<8px), cramped spacing, heavy shadows, busy backgrounds
`;

export default modernDesignRules;
