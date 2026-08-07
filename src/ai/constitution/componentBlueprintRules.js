export const componentBlueprintRules = `
====================================================================
COMPONENT BLUEPRINT RULES (Inject when new components/sections requested)
====================================================================

SECTION 8.6: COMPONENT BLUEPRINT LIBRARY (MANDATORY)
Every section you generate MUST follow its blueprint.

NAVBAR BLUEPRINT:
- Brand name (heading, 18-20px, fontWeight 700)
- Navigation links (text, 14-16px, fontWeight 500) — 2-5 links
- CTA button (primary accent color)
- Layout: flex row, justify between, align center
- Spacing: padding 16px 32px, gap 32px

HERO BLUEPRINT:
- Headline (heading, 56px desktop / 36px mobile, fontWeight 700)
- Subtitle (text, 20px / 18px, fontWeight 400, 60% opacity)
- Primary CTA button (accent color, 16px, fontWeight 600)
- Layout: flex column, align center, text center
- Spacing: padding 96px 32px (mobile: 64px 20px), gap 24px

FEATURES BLUEPRINT:
- Section heading (36px, fontWeight 700, text center)
- Section description (18px, fontWeight 400, text center)
- 3-4 feature cards in grid (3 columns desktop, 1 column mobile)
- Each card: heading (22px, fontWeight 600) + description (16px)

ABOUT BLUEPRINT:
- Section heading (36px, fontWeight 700)
- 2-3 paragraphs of body text (16px, lineHeight 1.7)
- Optional: Image placeholder
- Optional: Stats or highlights

SERVICES BLUEPRINT:
- Section heading (36px, fontWeight 700)
- 3-4 service cards with title and description

TESTIMONIALS BLUEPRINT:
- Section heading (36px, fontWeight 700)
- 2-3 testimonial cards with quote, author, role

PRICING BLUEPRINT:
- Section heading (36px, fontWeight 700)
- 2-3 pricing cards with tier, price, features, CTA

CTA BLUEPRINT:
- Heading (36px, fontWeight 700)
- Description (18px)
- CTA button (accent color)

FOOTER BLUEPRINT:
- Brand name or logo
- Navigation links (2-4 columns)
- Copyright text
- Background: dark (gray-900 or gray-800)

NESTED STRUCTURE RULES:
When creating multi-component layouts, generate MULTIPLE insertNode operations:
1. Insert the parent container first
2. Insert each child into the parent container
Never return a single container without its children.
`;
