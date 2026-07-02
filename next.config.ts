import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Property/logo images are user-supplied URLs (any HTTPS host) until the
      // R2 upload pipeline lands. Allow any HTTPS source so next/image can
      // optimize them; tighten to the R2 public host once uploads are wired.
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
