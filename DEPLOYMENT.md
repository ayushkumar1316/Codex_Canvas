# Vercel Deployment Guide

## Deployment Failures - Common Causes & Fixes

### Current Status
- ✅ Build succeeds locally (3.43s)
- ❌ Vercel deployments failing
- Root cause: Environment variables not configured in Vercel

---

## Fix Steps

### 1. Add Environment Variables in Vercel

Go to your Vercel project settings:

```
https://vercel.com/your-username/codex-canvas/settings/environment-variables
```

Add these variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_AI_PROVIDER` | `groq` | Production, Preview, Development |
| `VITE_GEMINI_API_KEY` | `your_gemini_key` | Production, Preview, Development |
| `VITE_GROQ_API_KEY` | `your_groq_key` | Production, Preview, Development |
| `VITE_OPENROUTER_API_KEY` | `your_openrouter_key` | Production, Preview, Development |

**Important:**
- Use your actual API keys (not placeholders)
- Set for ALL environments (Production, Preview, Development)
- Keys should be valid and active

---

### 2. Verify vercel.json

✅ File created with correct configuration

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "regions": ["iad1"],
  "env": {
    "VITE_AI_PROVIDER": "@VITE_AI_PROVIDER",
    "VITE_GEMINI_API_KEY": "@VITE_GEMINI_API_KEY",
    "VITE_GROQ_API_KEY": "@VITE_GROQ_API_KEY",
    "VITE_OPENROUTER_API_KEY": "@VITE_OPENROUTER_API_KEY"
  }
}
```

---

### 3. Trigger New Deployment

After adding environment variables:

**Option A: Via Vercel Dashboard**
1. Go to Deployments tab
2. Click "Redeploy" on latest commit
3. Check "Use existing Build Cache" = OFF
4. Click "Redeploy"

**Option B: Via Git Push**
```bash
git commit --allow-empty -m "trigger: redeploy with env vars"
git push origin main
```

---

## Common Deployment Errors

### Error: Build failed (Exit code 1)

**Cause:** Missing environment variables or invalid API keys

**Fix:**
1. Add all required env vars in Vercel dashboard
2. Verify keys are valid (test locally with `npm run build`)
3. Redeploy

---

### Error: VITE_* variables undefined

**Cause:** Variables not prefixed with `VITE_` or not set in Vercel

**Fix:**
1. Ensure all variables start with `VITE_`
2. Add in Vercel Environment Variables settings
3. Set for Production, Preview, and Development

---

### Error: Module not found

**Cause:** Dependency missing or import path wrong

**Fix:**
1. Run `npm install` locally to verify dependencies
2. Check `package.json` has all required packages
3. Commit `package-lock.json` if changed

---

### Error: Build timeout

**Cause:** Build taking too long (> 45s)

**Fix:**
1. Already optimized - build takes 3.43s locally
2. If still timing out, check Vercel logs for specific step
3. Contact Vercel support if persistent

---

## Verification Checklist

After deployment:

- [ ] Environment variables added in Vercel
- [ ] All 4 variables set (AI_PROVIDER + 3 API keys)
- [ ] Variables set for Production, Preview, Development
- [ ] New deployment triggered
- [ ] Build succeeds in Vercel
- [ ] Site loads at production URL
- [ ] AI generation works (test with a prompt)

---

## Testing Deployment

Once deployed, test:

1. **Load the site**
   ```
   https://your-project.vercel.app
   ```

2. **Open browser console** (F12)
   - Check for errors
   - Should see no red errors

3. **Test AI generation**
   - Create a new canvas
   - Enter prompt: "Create a simple landing page"
   - Verify generation works

4. **Check provider**
   - Console should show: `[Provider] Using: groq` or similar
   - If "API key missing" error → env vars not set correctly

---

## Debug Commands

Check build locally:
```bash
npm run build
npm run preview
```

Verify environment variables:
```bash
# In browser console after deployment
console.log(import.meta.env.VITE_AI_PROVIDER);
console.log(import.meta.env.VITE_GROQ_API_KEY ? 'KEY_SET' : 'KEY_MISSING');
```

---

## Support

If still failing after these steps:

1. Check Vercel deployment logs for specific error
2. Copy full error message
3. Check Vercel status page: https://www.vercel-status.com
4. Contact Vercel support if platform issue

---

## Quick Fix Summary

**Most common fix:** Add environment variables in Vercel dashboard

1. Go to Settings → Environment Variables
2. Add all 4 variables
3. Redeploy
4. ✅ Done

---

**Last Updated:** 2026-09-07T09:56:42Z
