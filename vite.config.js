import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode, command }) => {
  // Determine base path:
  // - For production builds (build command), use '/Software-Grp-Project/' for GitHub Pages
  // - For development (dev command), use '/'
  // - Can be overridden with --base flag
  const base = command === 'build' ? '/Software-Grp-Project/' : '/';
  
  return {
    base: base,
    plugins: [react()],
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
  };
})
