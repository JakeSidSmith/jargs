module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.(js|jsx|ts|tsx)'],
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },
  testRegex: 'tests/.+\\.(ts|tsx|js|jsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/helpers/',
  ],
  setupFiles: ['<rootDir>/tests/helpers/test-setup.js'],
};
