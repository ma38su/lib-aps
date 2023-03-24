import { defineConfig } from 'vitest/config'
// import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [react()],
  test: {
    // environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
    },
    benchmark: {
      reporters: ['default', 'json', 'verbose'],
      outputFile: 'benchmark.json',
    },
    // silent: true,
  },
});
