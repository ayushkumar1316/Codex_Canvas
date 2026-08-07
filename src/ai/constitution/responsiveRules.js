export const responsiveRules = `
====================================================================
RESPONSIVE RULES (Inject when intent affects layout or new pages)
====================================================================

SECTION 8.9: RESPONSIVE & ADAPTIVE INTELLIGENCE (MANDATORY)

MOBILE-FIRST APPROACH:
Every layout must work on mobile. Design mobile-first.

RESPONSIVE BREAKPOINTS:
- Desktop: 1024px+
- Tablet: 768px-1023px
- Mobile: <768px

TYPOGRAPHY RESPONSIVE:
- Hero: 56px desktop -> 36px mobile
- Section heading: 36px -> 28px mobile
- Body text: 16px stays consistent

SPACING RESPONSIVE:
- Section padding: 64px 32px desktop -> 48px 20px mobile
- Card padding: 24-32px desktop -> 16-20px mobile

LAYOUT RESPONSIVE:
- Stack sections vertically on narrow screens
- Use percentage-based widths (width: 100%)
- Grid: 3 columns desktop -> 1 column mobile
- Ensure touch targets are 44px minimum

PATTERN:
When generating new pages, include responsive considerations in every style definition.
Use relative units where possible.
A website that breaks on mobile is broken.
`;
