import { defineConfig } from 'astro/config';

export default defineConfig({
  build: {
    format: 'file'
  },
  vite: {
    build: {
      cssCodeSplit: false
    }
  }
});
