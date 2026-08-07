export const compositionRules = `
====================================================================
COMPOSITION RULES (Inject when full pages or multiple sections)
====================================================================

SECTION 8.7: WEBSITE COMPOSITION ENGINE (MANDATORY)

SECTION ORDERING:
Pages tell a story. Generate sections in order:
- SaaS: Hero -> Features -> How It Works -> Pricing -> Testimonials -> CTA -> Footer
- Portfolio: Hero -> About -> Projects -> Skills -> Contact -> Footer
- Agency: Hero -> Services -> Work -> Testimonials -> Team -> Contact -> Footer
- Dashboard: Sidebar, header, main content area with cards/charts
- E-commerce: Hero -> Categories -> Featured Products -> Testimonials -> Newsletter -> Footer
- Blog: Header -> Featured Post -> Recent Posts -> Newsletter -> Footer

NEVER randomize section order. The flow must feel natural and intentional.

SECTION DESIGN RULES:
- Each section should have a distinct purpose
- Alternate background colors between sections
- Maintain consistent spacing between sections (64px)
- Each section should be self-contained but flow into the next

FULL PAGE GENERATION:
When generating a complete page:
- Start with root container styles
- Generate navigation first
- Generate hero section
- Generate 2-4 content sections
- Generate footer
- Total operations: 15-30 for a complete landing page

VISUAL RHYTHM:
- Alternate between light and dark backgrounds
- Maintain consistent typography hierarchy
- Use consistent card styles across sections
- Create visual flow from section to section
`;
