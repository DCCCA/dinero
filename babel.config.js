const isTest = process.env.APP_ENV === 'test';

module.exports = {
  presets: [
    [
      '@babel/typescript',
    ],
    [
      '@babel/preset-env',
    ],
    [
      '@babel/preset-react',
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-syntax-nullish-coalescing-operator',
    '@babel/plugin-proposal-logical-assignment-operators',
    ...(isTest ? ['babel-plugin-transform-import-meta'] : []),
  ],
};