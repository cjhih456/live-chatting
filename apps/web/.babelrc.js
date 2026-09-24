module.exports = {
  presets: [
    ['babel-preset-expo', { jsxRuntime: 'automatic' }],
  ],
  plugins: [['react-native-web', { commonjs: true }]],
};
