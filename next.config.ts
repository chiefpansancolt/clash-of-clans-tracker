import withFlowbiteReact from "flowbite-react/plugin/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All public images are WebP files (named .png) — serve directly so browsers detect format by magic bytes
    unoptimized: true,
  },
};

export default withFlowbiteReact(nextConfig);
