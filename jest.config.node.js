module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        target: 'es2017',
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
      },
    }],
  },
  testRegex: '(/__tests__/.*(api|service)\\.(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@panva|oidc-token-hash|openid-client)/)'
  ],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};
