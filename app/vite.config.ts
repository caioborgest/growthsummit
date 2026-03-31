import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'og-image.png', 'fonts/*.woff2'],
      manifest: {
        id: 'com.growthexperience.app',
        name: 'Growth Experience 2026',
        short_name: 'GE 2026',
        description: 'Plataforma oficial do Growth Experience 2026 - O maior evento de Growth e IA do Sertão.',
        version: '1.2.0',
        start_url: '/',
        theme_color: '#21808D',
        background_color: '#0c0e12',
        display: 'standalone',
        orientation: 'portrait-primary',
        categories: ['education', 'business', 'event'],
        icons: [
          {
            src: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
           {
             src: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/gx-social-share.png',
             sizes: '1280x720',
             type: 'image/png',
             form_factor: 'wide',
             label: 'Dashboard Growth Experience'
           }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/xeuqtxxhncvechrxerqw\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    strictPort: false,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
        "worker-src 'self' blob:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai data:",
        "img-src 'self' data: https: blob: https://*.supabase.co",
        "media-src 'self' blob: https://*.supabase.co",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://api.ipify.org",
        "frame-src 'self' https://js.stripe.com https://www.youtube.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; '),
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(self)',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: ['es2020', 'safari13'],
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'utils-vendor': ['jspdf', 'jspdf-autotable', 'html5-qrcode', 'qrcode'],
          'icons': ['lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 2000
  },
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
        "worker-src 'self' blob:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai data:",
        "img-src 'self' data: https: blob: https://*.supabase.co",
        "media-src 'self' blob: https://*.supabase.co",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://api.ipify.org",
        "frame-src 'self' https://js.stripe.com https://www.youtube.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; '),
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(self)'
    }
  }
});
