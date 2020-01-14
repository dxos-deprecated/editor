//
// Copyright 2019 Wireline, Inc.
//

import { Schema } from 'prosemirror-model';

import basic from './basic';
import full from './full';
import textOnly from './text-only';

export const schemaConfigs = {
  basic,
  full,
  'text-only': textOnly
};

/**
 * 
 * @param {function[]} enhancers 
 * @param {string|object} schemaConfig 
 */
export const createSchema = (enhancers = [], schemaConfig = basic) => {

  let config = schemaConfig;

  if (typeof config === 'string') {
    config = schemaConfigs[schemaConfig];
  }

  config = enhancers.reduce((config, enhancer) => enhancer(config), config);

  return new Schema(config);
};
