//
// Copyright 2019 Wireline, Inc.
//

const path = require('path');

module.exports = async ({ config, mode }) => {
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto'
  });

  return config;
};
