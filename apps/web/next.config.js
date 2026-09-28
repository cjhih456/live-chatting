const path = require('path');
const { withExpo } = require('@expo/next-adapter');

const workspaceRoot = path.resolve(__dirname, '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'react-native',
    'react-native-web',
    'expo',
    'nativewind',
    'react-native-css',
    'react-native-reanimated',
    'react-native-svg',
    '@lumen/ui',
    '@lumen/data',
    '@lumen/structure',
    '@lumen/i18n',
    'lucide-react-native',
  ],
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      react: path.join(workspaceRoot, 'node_modules/react'),
      'react-dom': path.join(workspaceRoot, 'node_modules/react-dom'),
      'react/jsx-runtime': path.join(
        workspaceRoot,
        'node_modules/react/jsx-runtime',
      ),
      'react/jsx-dev-runtime': path.join(
        workspaceRoot,
        'node_modules/react/jsx-dev-runtime',
      ),
      '@tanstack/react-query': path.join(
        workspaceRoot,
        'node_modules/@tanstack/react-query',
      ),
    };
    config.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      ...config.resolve.extensions,
    ];
    return config;
  },
};

module.exports = withExpo(nextConfig);
