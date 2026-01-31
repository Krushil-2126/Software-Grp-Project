# GitHub Pages Deployment Guide

## Issue: 404 Errors for Assets

If you're getting 404 errors for JS/CSS files when deployed to GitHub Pages, follow these steps:

## Solution

1. **Build with the correct base path:**
   ```bash
   npm run build:gh-pages
   ```
   This builds with `base: '/software/'` for GitHub Pages.

2. **Deploy to gh-pages branch:**
   ```bash
   npm run deploy
   ```
   This will:
   - Build the project with the correct base path
   - Deploy the `dist` folder to the `gh-pages` branch

3. **Configure GitHub Pages:**
   - Go to your repository settings
   - Navigate to Pages
   - Set source to `gh-pages` branch
   - Save

## Important Files

- `vite.config.js`: Sets base path to `/software/` for production
- `public/404.html`: Handles SPA routing for GitHub Pages
- `src/App.jsx`: Router basename matches Vite base path

## Verification

After deployment, your site should be available at:
`https://krushil21386.github.io/software/`

All assets should load correctly with the `/software/` base path.
