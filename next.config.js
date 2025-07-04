/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  typescript: {
    // !! WARN !!
    // Временно отключаем проверку типов для сборки
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Временно отключаем проверку линтера для сборки
    ignoreDuringBuilds: true,
  },
  // Настройки для обработки больших файлов
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: '50mb',
  },
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
      },
      {
        protocol: 'https',
        hostname: 'lesyasvet.storage.yandexcloud.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.storage.yandexcloud.net',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default config;
