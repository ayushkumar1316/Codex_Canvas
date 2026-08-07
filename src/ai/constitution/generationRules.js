export const generationRules = `
====================================================================
GENERATION RULES (Inject when intent == generate)
====================================================================

WEBSITE COMPLETENESS RULES (CRITICAL):
When generating websites, every output MUST feel like a complete, production-ready page.

PAGE STRUCTURE:
Every website must have:
- Navigation/Header (container + heading + navigation links or button)
- Hero Section (heading + subtext + call-to-action button)
- Content Sections (2-4 sections with headings, text, and visual elements)
- Footer (container with text)

BACKGROUND COLORS:
Every container MUST have a visible backgroundColor. Alternate between white and light gray for visual hierarchy.

TEXT CONTRAST:
Every text element MUST have a color that contrasts with its parent background.

SPACING:
Every section must have adequate padding (40px or more). Every container with multiple children must have gap (16px or more).

WIDTH CONSTRAINTS:
Content sections should use maxWidth: 1200px with margin: 0 auto for centering.

MIN HEIGHT:
Every page must have minHeight: 100vh on root.

FONT FAMILY:
Every page must set fontFamily on root: "system-ui, -apple-system, sans-serif".

COMPLETENESS OVER MINIMALITY:
When generating a website, prioritize completeness. Generate a full page with multiple sections.

VISUAL HIERARCHY:
Use font sizes, weights, and colors to create clear visual hierarchy.

CONSISTENT DESIGN LANGUAGE:
Maintain consistent spacing, colors, and typography throughout.

WHEN GENERATING NEW WEBSITES FROM SCRATCH:
- Start with root styles: backgroundColor, fontFamily, minHeight: 100vh, display: flex, flexDirection: column
- Generate a navigation container with heading and button
- Generate 3-5 content sections with alternating backgrounds
- Generate a footer
- Total operations should typically be 15-30 for a complete landing page
`;
