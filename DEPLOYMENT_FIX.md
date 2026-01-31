# Fix for 404 Errors on GitHub Pages

## The Problem
Assets (JS/CSS files) are returning 404 errors when deployed to GitHub Pages.

## Root Cause
The build might not be using the correct base path, or the deployment method isn't consistent.

## Solution Steps

### Step 1: Clean and Rebuild
```bash
# Remove old build
rm -rf dist

# Rebuild with correct base path
npm run build:gh-pages
```

### Step 2: Verify the Build
Check that `dist/index.html` has paths starting with `/software/`:
```html
<script src="/software/assets/index-xxx.js"></script>
<link href="/software/assets/index-xxx.css">
```

### Step 3: Deploy
```bash
npm run deploy
```

### Step 4: Verify GitHub Pages Settings
1. Go to repository Settings → Pages
2. Source should be: **gh-pages branch** (not main branch)
3. Folder should be: **/ (root)**
4. Save

### Step 5: Check the URL
Your site should be at:
- `https://krushil21386.github.io/software/` ✅
- NOT at: `https://krushil21386.github.io/` ❌

## If Still Getting 404s

### Option A: Check Browser Console
Open browser DevTools → Network tab → See which exact files are 404ing

### Option B: Verify Repository Name
- Repository must be named exactly: `software`
- If it's different, update `vite.config.js` base path to match

### Option C: Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or try incognito/private mode

### Option D: Check gh-pages Branch
```bash
git checkout gh-pages
ls -la
# Should see: index.html, assets/, medicineModel.json, 404.html
```

## Expected File Structure in gh-pages branch:
```
/
├── index.html
├── 404.html
├── medicineModel.json
├── vite.svg
└── assets/
    ├── index-xxx.js
    └── index-xxx.css
```

All paths in index.html should start with `/software/`
