import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';
import obfuscator from 'vite-plugin-javascript-obfuscator';
import sitemap from '@astrojs/sitemap';

const svgIcon = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23dc2626' d='M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z'/%3E%3C/svg%3E";

export default defineConfig({
  site: 'https://dramague.com',
  base: '/',
  output: 'static',
  integrations: [
    react(),
    sitemap(),
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Drama Gue - Enterprise Streaming',
        short_name: 'Drama Gue',
        description: 'Platform streaming video hiburan, aksi, dan drama terbaik dengan kualitas tinggi.',
        theme_color: '#dc2626',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          { src: svgIcon, sizes: '192x192', type: 'image/svg+xml' },
          { src: svgIcon, sizes: '512x512', type: 'image/svg+xml' },
          { src: svgIcon, sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg}']
      },
      devOptions: {
        enabled: false,
        navigateFallbackAllowlist: [/^\//]
      }
    })
  ],
  vite: {
    plugins: [
      tailwindcss(),
      obfuscator({
        include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
        exclude: [/node_modules/],
        apply: 'build',
        debugger: true,
        options: {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 1,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 1,
          debugProtection: true,
          debugProtectionInterval: 4000,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: true,
          renameGlobals: false,
          selfDefending: true,
          simplify: true,
          splitStrings: true,
          splitStringsChunkLength: 5,
          stringArray: true,
          stringArrayCallsTransform: true,
          stringArrayEncoding: ['rc4'],
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 5,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersParametersMaxCount: 5,
          stringArrayWrappersType: 'function',
          stringArrayThreshold: 1,
          transformObjectKeys: true,
          unicodeEscapeSequence: false
        }
      })
    ]
  }
});