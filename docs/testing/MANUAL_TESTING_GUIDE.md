# V2 Manual Testing Guide

## Server Status
- Dev Server: `http://localhost:5174`
- Status: ✅ Running
- Ready for manual UI testing

---

## Test Scenarios to Execute in Browser

### Scenario 1: Fresh Page Generation

**Steps:**
1. Open http://localhost:5174
2. Click "New Project"
3. Enter prompt: "Create a modern SaaS landing page with hero section, features grid, and CTA buttons"
4. Wait for generation to complete

**Expected Results:**
- ✅ Full page generated with multiple sections
- ✅ Hero section with title and CTA button
- ✅ Features grid with 3+ feature cards
- ✅ All components have semantic IDs
- ✅ CSS styling applied correctly
- ✅ No console errors
- ✅ Chat shows generation message

**Verification Checklist:**
- [ ] Page loads without errors
- [ ] All sections visible
- [ ] Colors and fonts look good
- [ ] Buttons are clickable
- [ ] Layout is responsive
- [ ] Chat history shows generation

---

### Scenario 2: Simple Single Edit

**Steps:**
1. (From Scenario 1) Page should be generated
2. Click on the hero title
3. Enter prompt: "Make the title text larger and bold"
4. Wait for edit to apply

**Expected Results:**
- ✅ Hero title font size increases
- ✅ Font weight becomes bold
- ✅ Change visible immediately
- ✅ Other components unchanged
- ✅ Chat shows edit message
- ✅ No console errors

**Verification Checklist:**
- [ ] Title visibly larger
- [ ] Title is bold
- [ ] Other text unchanged
- [ ] Page layout intact
- [ ] Chat history updated

---

### Scenario 3: Multiple Sequential Edits

**Steps:**
1. (From Scenario 2) After title edit
2. Click on the primary CTA button
3. Prompt: "Make buttons orange with rounded corners"
4. After applying, click features section
5. Prompt: "Add more padding and spacing to feature cards"
6. After applying, prompt: "Make all text white and add dark background"

**Expected Results:**
- ✅ Edit 1: Button becomes orange with rounded corners
- ✅ Edit 2: Feature cards have more spacing/padding
- ✅ Edit 3: Background darkens, text turns white
- ✅ All previous edits remain applied
- ✅ Each edit shows in chat
- ✅ Page doesn't break
- ✅ No stale DOM elements

**Verification Checklist:**
- [ ] Button is orange and rounded
- [ ] Feature cards have spacing
- [ ] Dark background with white text
- [ ] All edits persisted
- [ ] Chat shows 3 edit messages
- [ ] Page renders correctly

---

### Scenario 4: Pronoun Resolution

**Steps:**
1. (From Scenario 3) Multiple edits applied
2. Prompt: "Make it red" (should apply to last edited component)
3. Wait for response
4. Prompt: "Now make them bigger" (should apply to related components)
5. Wait for response

**Expected Results:**
- ✅ "Make it red" - Last edited section/button becomes red
- ✅ "Make them bigger" - Related elements increase in size
- ✅ System correctly resolves pronouns from context
- ✅ Chat shows both prompts and responses
- ✅ Correct components updated (not random ones)

**Verification Checklist:**
- [ ] Pronoun "it" resolves to correct component
- [ ] Pronoun "them" targets related components
- [ ] System understood the context
- [ ] Changes applied accurately

---

### Scenario 5: Error Handling

**Steps:**
1. (From Scenario 4) Working application
2. In chat, type: "Edit the component with ID xyz_nonexistent_999"
3. Try to apply an invalid operation
4. Continue with a valid prompt

**Expected Results:**
- ✅ Error message shown clearly
- ✅ User understands what went wrong
- ✅ Page doesn't break or show stale content
- ✅ Can retry after error
- ✅ Normal operations work after error

**Verification Checklist:**
- [ ] Error message clear and helpful
- [ ] Page still responsive
- [ ] Can apply new edits after error
- [ ] No console errors with red X

---

### Scenario 6: Streaming and Progressive Updates

**Steps:**
1. Enter a complex prompt: "Create a pricing page with monthly/annual toggle, feature comparison table, and FAQ accordion"
2. Watch the StreamingProgress component

**Expected Results:**
- ✅ Operations appear progressively
- ✅ StreamingProgress shows operation count
- ✅ UI updates as operations stream in
- ✅ Final result is complete and correct
- ✅ No visual glitches during streaming

**Verification Checklist:**
- [ ] StreamingProgress visible
- [ ] Operation count increases
- [ ] UI updates smoothly
- [ ] Final page looks good

---

### Scenario 7: Inline AI Modifier

**Steps:**
1. (From previous scenario) Hover over a component
2. An inline AI modifier should appear
3. Click it and enter: "Make this bigger"

**Expected Results:**
- ✅ Inline modifier appears on hover
- ✅ Can type prompt directly
- ✅ Enter applies the change
- ✅ Component updates without full regeneration
- ✅ Quick feedback

**Verification Checklist:**
- [ ] Modifier widget appears
- [ ] Can type prompt
- [ ] Enter applies change
- [ ] Component updates

---

### Scenario 8: Chat Context Preservation

**Steps:**
1. (From Scenario 7) Chat with multiple messages
2. Scroll up in chat to see history
3. Verify all messages visible
4. Make a new edit

**Expected Results:**
- ✅ Full chat history visible
- ✅ Each edit shows sender (You/Assistant)
- ✅ Timestamps present
- ✅ Context preserved across edits
- ✅ Chat scrolls properly

**Verification Checklist:**
- [ ] Chat history complete
- [ ] Messages show sender
- [ ] Context carries through
- [ ] New edits use full context

---

### Scenario 9: Responsive Design

**Steps:**
1. (From Scenario 8) Working page with multiple edits
2. Resize browser window to mobile size (375px)
3. Check if layout adjusts
4. Resize to tablet (768px)
5. Resize back to desktop (1920px)

**Expected Results:**
- ✅ Layout responds to viewport changes
- ✅ Components stack on mobile
- ✅ Grid adjusts columns
- ✅ Text remains readable
- ✅ No horizontal scroll
- ✅ No broken layouts

**Verification Checklist:**
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] No layout shifts
- [ ] All text visible

---

### Scenario 10: Provider Fallback

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Apply a complex edit
4. Watch network requests
5. Check that OpenRouter is tried first (if enabled)
6. If it fails with non-JSON, verify fallback to Groq happens

**Expected Results:**
- ✅ Provider requests visible in Network tab
- ✅ OpenRouter called first if enabled
- ✅ Fast-fail if non-JSON response
- ✅ Fallback to Groq on failure
- ✅ Final result successful
- ✅ Console shows provider info

**Verification Checklist:**
- [ ] Provider request logged
- [ ] Fallback chain working
- [ ] Operation succeeds
- [ ] No error messages

---

## Console Checks

Open DevTools (F12) → Console and look for:

### Expected Logs
```
[Pipeline] Stage: { prompt: "...", hasImage: false, mode: "generation" }
[Pipeline] Prompt Optimized: { type: "...", confidence: ... }
[Intent] Detected: { intent: "...", confidence: ... }
[Strategy] Resolved: { strategy: "...", executionType: "..." }
[Provider] Response Received: { provider: "groq", success: true, ... }
[OpenRouter] Response does not look like JSON - Fast failing
[ProviderManager] Falling back to gemini...
[StreamingProgress] Operation update: { count: 5, lastOp: "update" }
```

### Red Flags (Should NOT see)
```
❌ Uncaught TypeError
❌ Uncaught ReferenceError
❌ Cannot read property of undefined
❌ Failed to parse JSON
❌ Infinite loop warnings
❌ Memory leak warnings
```

---

## Performance Checks

### Metrics to Monitor

1. **Generation Time**
   - First prompt to complete page: Should be < 10 seconds
   - Accept 5-15 seconds depending on provider

2. **Edit Time**
   - Single component edit: Should be < 3 seconds
   - Multiple edits: Should be < 5 seconds each

3. **Memory Usage**
   - Initial load: < 50 MB
   - After 10+ edits: Should not exceed 100 MB

4. **DOM Elements**
   - Count elements in DevTools → Elements
   - Should match component count
   - Should not accumulate old/stale elements

---

## Bug Report Template

If you find issues during testing, note:

```
**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Console Errors:**
(Paste any red error messages)

**Screenshots:**
(If possible)

**System:**
- Browser: 
- OS: 
- Time: 
```

---

## Success Criteria

### Minimum Requirements
- ✅ Generation works (at least 1 complete page)
- ✅ Single edits apply correctly
- ✅ Multiple edits don't break page
- ✅ No red console errors
- ✅ Chat shows messages

### Good to Have
- ✅ Pronouns resolve correctly
- ✅ Inline modifier works
- ✅ Streaming shows progress
- ✅ Provider fallback works
- ✅ Responsive layout works

### Great to Have
- ✅ Pages compare to Lovable/v0 quality
- ✅ Performance < 3s per edit
- ✅ No stale DOM elements
- ✅ Full pronoun context
- ✅ Edge cases handled

---

## Next Steps After Manual Testing

1. **If All Tests Pass:** 
   - Commit test results
   - Create V2 release notes
   - Deploy to staging
   - Get user feedback

2. **If Some Tests Fail:**
   - Note bug in template above
   - Create GitHub issue
   - Diagnose and fix
   - Re-test

3. **Performance Issues:**
   - Profile with DevTools
   - Check for memory leaks
   - Optimize critical paths
   - Re-benchmark

---

**Start Testing at:** http://localhost:5174  
**Generated:** 2026-09-07T09:31:08Z  
**Test Status:** Ready for manual execution
