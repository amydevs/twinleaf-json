/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

import createMDX from '@next/mdx';

/** @type {import("next").NextConfig} */
const config = {
  output: "export",
  reactStrictMode: true,
  basePath: process.env.BASE_PATH ?? "",

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  transpilePackages: ["geist"],
  images: {
    unoptimized: true,
  },
  experimental: {
    mdxRs: true,
  }
};

const withMDX = createMDX();

export default withMDX(config);
