// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';
import remarkIconify from './src/remark/remark-iconify.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://phantomoffkanagawa.github.io',
  base: '/personal-blog/',
  integrations: [mdx(), sitemap(), icon()],

  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkIconify],
  },
});