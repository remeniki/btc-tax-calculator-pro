import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/btc-tax-calculator-pro/',
  plugins: [react()],
});
