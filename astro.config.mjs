// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://tapyourboat.com',
  output: 'static',
  server: { port: 4322 },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/dashboard') &&
        !page.includes('/account') &&
        !page.includes('/bookings') &&
        !page.includes('/confirm-booking') &&
        !page.includes('/booking-success') &&
        !page.includes('/favorites') &&
        !page.includes('/messages') &&
        !page.includes('/my-offers') &&
        !page.includes('/list-your-boat') &&
        !page.includes('/404'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', gr: 'el' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
