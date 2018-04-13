const path = require('path');

const baseDir = path.resolve(__dirname, './');
const cwd = path.resolve(process.cwd(), './');

module.exports = {
  roots: [cwd],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  coverageDirectory: 'coverage',
  moduleFileExtensions: [
    'js',
    // 'ts',
  ],
  transform: {
    '^.+\\.js$': `${baseDir}/jest.transform.js`,
    // '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    // '**/*.test.(ts|js)',
    '**/*.test.js',
  ],
  testEnvironment: 'node',
  browser: true,
  // globals: {
  //   'ts-jest': {
  //     tsConfigFile: './tsconfig.jest.json',
  //   },
  // },
};
