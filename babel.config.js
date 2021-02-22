module.exports = {
  plugins: [["istanbul",{},'babel-plugin-istanbul']],
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
