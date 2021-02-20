module.exports = {
  plugins:[["istanbul",{},'plugin-cypress-code-coverage']],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};
