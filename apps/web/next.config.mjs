// ─── CONFIG NEXT.JS ──────────────────────────────────────────────────────────
//
// transpilePackages: indica a Next que compile los paquetes del workspace
// que se importan en TS directamente (sin paso de build). Sin esto los
// imports de @pendulo/* fallarían al hacer next build.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  transpilePackages: [
    '@pendulo/physics',
    '@pendulo/schemas',
    '@pendulo/ui',
  ],

  // En dev apuntamos las llamadas /api/* hacia apps/api (puerto 4000).
  // En prod ambos deployan separados — usar variable de entorno NEXT_PUBLIC_API_URL.
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        { source: '/api/v1/:path*', destination: 'http://localhost:4000/api/v1/:path*' },
      ]
    }
    return []
  },

  // Headers de seguridad mínimos
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
