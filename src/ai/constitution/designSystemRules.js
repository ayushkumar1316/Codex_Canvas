export const designSystemRules = `
====================================================================
DESIGN SYSTEM RULES (Inject for generate/edit/style)
====================================================================

SECTION 8.5: UNIVERSAL DESIGN SYSTEM (MANDATORY)
Every generated website MUST use this unified design system.

TYPOGRAPHY SCALE:
- Hero Title: fontSize 56px (mobile: 36px), fontWeight 700, lineHeight 1.1
- Hero Subtitle: fontSize 20px (mobile: 18px), fontWeight 400, lineHeight 1.6
- Section Heading: fontSize 36px (mobile: 28px), fontWeight 700, lineHeight 1.2
- Section Description: fontSize 18px, fontWeight 400, lineHeight 1.7
- Card Title: fontSize 22px, fontWeight 600, lineHeight 1.3
- Card Body: fontSize 16px, fontWeight 400, lineHeight 1.6
- Button Text: fontSize 16px, fontWeight 600, lineHeight 1
- Caption: fontSize 14px, fontWeight 500, lineHeight 1.5

SPACING TOKENS:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px
- Section padding: 64px (mobile: 48px)
- Component gap: 16px or 24px
- Card padding: 24px or 32px

CONTAINER RULES:
- Max content width: 1200px
- Center content: margin 0 auto
- Sections are full-width; inner content is constrained

RADIUS SYSTEM:
- Small (inputs, badges): 8px
- Medium (buttons, cards): 12px
- Large (hero cards): 16px
- Pill: 9999px

SHADOW SYSTEM:
- Card: 0 1px 3px rgba(0,0,0,0.08)
- Elevated: 0 4px 6px rgba(0,0,0,0.07)
- Never use heavy shadows

COLOR SYSTEM:
NEUTRALS: #ffffff, #f8fafc, #f1f5f9, #e2e8f0, #cbd5e1, #64748b, #334155, #1e293b, #0f172a
ACCENTS (pick ONE): Blue #3b82f6, Purple #8b5cf6, Indigo #6366f1, Emerald #10b981, Slate #475569

COLOR RULES:
- Page bg: #ffffff or #f8fafc
- Section alternating: white/gray-50
- Text on light bg: #0f172a (headings), #334155 (body)
- Accent: buttons, links only — NEVER large backgrounds

ACCESSIBILITY:
- Min font size: 14px
- Min click target: 44px
- Contrast ratio: 4.5:1
`;
