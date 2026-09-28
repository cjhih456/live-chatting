import type { Config } from 'jest';

const config: Config = {
  displayName: 'data',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        diagnostics: false,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'bundler',
          esModuleInterop: true,
          resolveJsonModule: true,
          allowSyntheticDefaultImports: true,
          isolatedModules: true,
        },
      },
    ],
  },
  transformIgnorePatterns: [],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'json'],
  moduleNameMapper: {
    '^@lumen/structure$': '<rootDir>/../structure/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
