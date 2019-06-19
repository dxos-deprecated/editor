//
// Copyright 2019 Wireline, Inc.
//
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = async ({ config, mode }) => {
  config.node = { fs: 'empty', child_process: 'empty' };
  config.plugins.push(
    new CopyWebpackPlugin(['./', './node_modules/@wirelineio/automerge-worker/dist/umd/automerge.worker.js']),
  );

  return config;
};
