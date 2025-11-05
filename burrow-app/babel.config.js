module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@store': './src/store',
            '@database': './src/database',
            '@utils': './src/utils',
            '@types': './src/types'
          }
        }
      ]
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel']
      }
    }
  };
};
