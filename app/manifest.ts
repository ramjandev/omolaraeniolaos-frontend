import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'McEniesVite Gate Staff',
    short_name: 'Gate Access',
    description: 'Fast turnstile access control and attendee verification for McEniesVite',
    start_url: '/gate-staff',
    display: 'standalone',
    background_color: '#FBFAF6',
    theme_color: '#7A3B18',
    icons: [
      {
        src: '/images/gate/qr-code.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/gate/qr-code.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
