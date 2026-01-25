const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'photos-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 7 dni
        }
      }
    }
  ]
})

module.exports = withPWA({
  // Twój istniejący config
})
