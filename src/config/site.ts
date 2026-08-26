export const siteConfig = {
  title: '有个浏览器',
  description: '团队协作指纹浏览器',
  keywords: ['有个浏览器', 'One Browser', '指纹浏览器', '团队协作'],
  og: {
    title: '有个浏览器',
    description: '团队协作指纹浏览器',
    image: 'https://one-browser.local/pwa-512x512.png',
    url: 'https://one-browser.local',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '有个浏览器',
    description: '团队协作指纹浏览器',
    image: 'https://one-browser.local/pwa-512x512.png',
  },
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '有个浏览器',
    url: 'https://one-browser.local',
    description: '团队协作指纹浏览器',
    publisher: {
      '@type': 'Organization',
      name: 'One Browser',
      logo: {
        '@type': 'ImageObject',
        image: 'https://one-browser.local/pwa-512x512.png',
      },
    },
  },
} as const;
