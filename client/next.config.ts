import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const clientRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Removes Next.js's development-only floating "N" toolbar.
  devIndicators: false,
  turbopack: {
    root: clientRoot,
  },
};
export default nextConfig;
