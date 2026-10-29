import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old single-caption shop bookmarks now point to the version roadmap.
      // Preserve /store/checkout.html for historical order downloads.
      {source: '/store/index.html', destination: '/welcome/index.html#versions', permanent: false},
    ];
  },
};

export default nextConfig;
