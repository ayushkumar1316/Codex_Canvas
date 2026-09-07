# Codex Canvas UI Enhancement Plan

## Overview
This plan outlines the UI enhancements needed for Codex Canvas based on the UI audit and user feedback. The focus is on fixing foundational issues, improving the Inspector panel, adding responsive preview capabilities, enhancing build-in animations, and implementing theme switching and dynamic AI status displays.

## Issues to Address

### 1. Font Loading Issue
**Problem**: Geist Variable font is installed but not imported, causing fallback to Segoe UI.
**Solution**: 
- Import Geist Variable font in main.jsx
- Define --font-sans CSS variable in index.css
- Ensure consistent font usage throughout the application

### 2. Inspector Panel Reconstruction
**Problem**: Inspector panel is rated 6/10 - consists of raw text fields lacking proper UI controls.
**Solution**:
- Replace text fields with appropriate input components:
  - Color pickers for color properties
  - Dropdowns for enum/select properties
  - Sliders/numeric steppers for numeric values
  - Toggle switches for boolean properties
- Improve layout and spacing
- Increase base panel text to minimum 12px for readability
- Add proper labeling and help text where needed

### 3. Responsive Preview Capabilities
**Problem**: Lack of responsive preview for different device sizes.
**Solution**:
- Add device preview controls (desktop/tablet/mobile)
- Implement responsive breakpoint visualization
- Allow switching between common device widths
- Show device frames around preview when applicable

### 4. Build-in Animations Enhancement
**Problem**: User wants visible progress/build animations during AI generation to avoid perception of frozen app.
**Solution** (building on existing codex-canvas-build-animations.html):
- Integrate assemble-in animation for new components appearing from prompt bar
- Add skeleton shimmer for loading states
- Implement step progress ring showing AI workflow stages
- Add light sweep effect during composition phase
- Enhance success burst on completion
- Ensure all animations respect prefers-reduced-motion setting

### 5. Theme Switching (Dark/Light/System)
**Problem**: No ability to switch between color themes; application is fixed in dark mode.
**Solution**:
- Add theme selector in top bar (dark/light/system)
- Implement CSS variables for theme colors
- Store user preference in localStorage
- Respect system preference when "system" mode is selected
- Ensure smooth transitions between themes

### 6. AI Working Pop-up Styling
**Problem**: Temporary pop-up that appears while AI is working has inconsistent styling and is sometimes hidden behind the down AI bar.
**Solution**:
- Refactor pop-up styling for better visibility
- Ensure proper z-index to prevent being hidden behind other elements
- Apply consistent animation styles matching the build-in animations
- Improve positioning to avoid overlap with AI status bar

### 7. Dynamic AI Status Display
**Problem**: Down AI bar shows static "open router" text that doesn't reflect the actual model being used.
**Solution**:
- Replace static text with dynamic model name display
- Show actual model/provider being used for AI generation
- Update text in real-time as model changes
- Apply appropriate styling to match the overall design system
- Ensure text is readable and properly aligned

### 8. Visual Improvements
**Problem**: Contrast issues and small text sizes.
**Solution**:
- Sweep zinc-500 → zinc-400 and zinc-600 → zinc-500 for muted text
- Bump fixed 10-11px labels to minimum 12px
- Extend Landing's gradient+dot-grid backdrop to editor canvas for visual consistency

## Implementation Phases

### Phase 1: Foundation Fixes
- [ ] Fix Geist font import and --font-sans variable
- [ ] Apply zinc tone adjustments for better contrast
- [ ] Increase minimum font sizes to 12px
- [ ] Extend gradient+dot-grid backdrop to editor canvas

### Phase 2: Inspector Panel Overhaul
- [ ] Audit all inspector properties and determine appropriate input types
- [ ] Implement color picker components
- [ ] Implement dropdown/select components
- [ ] Implement slider/stepper components
- [ ] Replace text fields with appropriate controls
- [ ] Improve panel layout and spacing
- [ ] Ensure accessibility standards are met

### Phase 3: Responsive Preview System
- [ ] Add device preview toolbar
- [ ] Implement responsive breakpoint detection
- [ ] Add device frame visualization
- [ ] Create preview state management
- [ ] Test with common device widths (mobile, tablet, desktop)

### Phase 4: Theme Switching Implementation
- [ ] Design theme selector UI for top bar
- [ ] Implement CSS variable-based theming system
- [ ] Add dark, light, and system theme options
- [ ] Implement localStorage persistence for user preference
- [ ] Add system preference detection for "system" mode
- [ ] Ensure smooth theme transitions

### Phase 5: Animation Integration
- [ ] Extract animation concepts from codex-canvas-build-animations.html
- [ ] Integrate assemble-in animation for component creation
- [ ] Add skeleton shimmer for loading states
- [ ] Implement step ring for AI progress tracking
- [ ] Add light sweep during composition
- [ ] Enhance success burst on completion
- [ ] Ensure animation performance optimization
- [ ] Respect prefers-reduced-motion preferences

### Phase 6: AI Status and Pop-up Improvements
- [ ] Refactor temporary AI working pop-up styling and positioning
- [ ] Ensure proper z-index to prevent overlap issues
- [ ] Implement dynamic model name display in AI status bar
- [ ] Connect to AI generation pipeline to get actual model/provider info
- [ ] Apply consistent styling with design system
- [ ] Test visibility and positioning across different states

### Phase 7: Polish and Testing
- [ ] Comprehensive UI testing across breakpoints
- [ ] Accessibility audit (color contrast, keyboard navigation)
- [ ] Performance testing with animations and theme switching
- [ ] User feedback collection and iteration
- [ ] Final QA and bug fixing

## Success Criteria

### Functional
- Geist font properly loads and displays
- Inspector panel uses appropriate input controls for all properties
- Responsive preview works for mobile, tablet, and desktop views
- Build-in animations provide clear visual feedback during AI operations
- Theme switching works correctly between dark, light, and system modes
- Temporary AI pop-up is properly styled and positioned
- AI status bar displays actual model/provider name dynamically
- All animations can be disabled via prefers-reduced-motion

### Visual
- Minimum contrast ratio of 4.5:1 for text
- Consistent typography with minimum 12px base size
- Unified visual language between landing page and editor
- Professional appearance matching modern design standards
- Consistent theme application across all UI elements
- Proper layering and z-index management

### Technical
- Clean implementation following existing code patterns
- Proper separation of concerns
- Minimal performance impact
- Easy maintenance and extension
- Robust state management for theme and AI status

## Files to Modify
Based on the codex_canvas reference:
- `main.jsx` - Font import, theme initialization
- `index.css` - CSS variables, font definitions, visual adjustments, theme variables
- Inspector panel components (various files)
- Preview/canvas container (for responsive features)
- Animation utility files or integration points
- Global styles for backdrop extension
- Top bar component (for theme selector)
- AI status bar component (for dynamic model display)
- Temporary pop-up component (for styling improvements)
- Theme context/provider (for theme state management)

## Dependencies
- May require additional UI component libraries for color pickers, sliders, etc.
- Should leverage existing animation capabilities where possible
- Need to ensure compatibility with current AI generation pipeline
- May need theme context/provider implementation if not already present

## Open Questions
1. What UI component library is currently used (if any)?
2. Are there existing animation utilities we should build upon?
3. What are the exact breakpoints needed for responsive preview?
4. How should the device preview controls be positioned and styled?
5. Are there performance constraints we need to consider for animation integration?
6. How is the AI generation pipeline structured to access current model/provider info?
7. Where is the temporary AI pop-up implemented in the codebase?
8. What is the current theme implementation approach (if any)?