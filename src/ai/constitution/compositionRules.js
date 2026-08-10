export const compositionRules = `
====================================================================
COMPOSITION RULES (Inject when full pages or multiple sections)
====================================================================

SECTION 8.7: WEBSITE COMPOSITION ENGINE (MANDATORY)

VALID OPERATION TYPES (STRICT):
Only use these operation types: 'insertNode', 'updateProps', 'updateStyles', 'deleteNode', 'replaceNode'.
Do NOT use 'add_child', 'create_component', 'addComponent', 'replace_tree', or any other operation type.

ALLOWED COMPONENT TYPES (STRICT):
Only use these component types: 'root', 'container', 'heading', 'text', 'button', 'input', 'textarea', 'image', 'card'.
Component types are case-sensitive. Always use lowercase: 'heading' not 'Heading', 'button' not 'Button'.
Never invent new component types outside this list.

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
