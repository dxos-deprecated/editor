const path = require('path');

module.exports = {
  stories: ['../**/*.stories.js'],

  webpackFinal: async (config) => {

    config.resolve = {
      alias: {
        'yjs': path.resolve(__dirname, '..', '..', '..', 'node_modules', 'yjs')
      }
    }

    return config;
  },
};