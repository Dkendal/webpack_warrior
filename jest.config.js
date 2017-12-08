module.exports = {
  transform: {
    '^.+\\.tsx?$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[tj]s?(x)',
    '<rootDir>/src/**/?(*.)(spec|test).[tj]s?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
