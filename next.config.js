/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.yandex.net',
        port: '',
        pathname: '/get-music-content/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.yandex.ru',
        port: '',
        pathname: '/get-music-content/**',
      },
      {
        protocol: 'https',
        hostname: 'music.yandex.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'music.yandex.ru',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default config;
