import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Explicitly set the root to the current directory to avoid incorrect inference
    // of the workspace root from parent directories.
    root: path.resolve(process.cwd()),
  }
};

export default nextConfig;
