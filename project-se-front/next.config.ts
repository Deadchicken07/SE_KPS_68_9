import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: true,
    webpackBuildWorker: false,
    turbopackPluginRuntimeStrategy: "workerThreads",
  },
};

export default nextConfig;
