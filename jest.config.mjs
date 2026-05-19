export default {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  testMatch: ['**/tests/**/*.test.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@mediapipe|@tensorflow|blockly)/)',
  ],
};
