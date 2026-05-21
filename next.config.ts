import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Prefer this project when multiple package-lock.json files exist (e.g. under the user home directory).
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
};

export default nextConfig;
