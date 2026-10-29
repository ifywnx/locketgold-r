import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep historical public URLs working while serving one canonical copy.
  async rewrites() {
    return [
      {source: '/welcome/captions/catalog.json', destination: '/captions/catalog.json'},
      {source: '/welcome/captions/studio.js', destination: '/captions/studio.js'},
      {source: '/welcome/captions/studio-effects.js', destination: '/captions/studio-effects.js'},
      {source: '/welcome/captions/studio-effects.css', destination: '/captions/studio-effects.css'},
      {source: '/images/locket-welcome-ifywnx-v5.png', destination: '/welcome/images/locket-welcome-ifywnx-v5.png'},
    ];
  },
  async redirects() {
    return [
      // Old single-caption shop bookmarks now point to the version roadmap.
      // Preserve /store/checkout.html for historical order downloads.
      {source: '/store/index.html', destination: '/welcome/index.html#versions', permanent: false},
    ];
  },
};

export default nextConfig;
