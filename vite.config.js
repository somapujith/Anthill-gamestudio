import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Windows can briefly lock new files while parallel editors write them.
      usePolling: process.platform === 'win32',
      interval: 250,
      ignored: ['**/scripts/**', '**/tmp/**', '**/output/**', '**/.playwright-cli/**', '**/*.pdf'],
    },
  },
});
