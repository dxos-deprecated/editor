//
// Copyright 2019 Wireline, Inc.
//

import { Schema } from 'prosemirror-model';

import basicSchema from './basic-schema';
import richTextSchema from './rich-text-schema';

export const createSchema = (enhancers = [], basic = false) => {

  const schemaConfig = basic ? basicSchema : richTextSchema;

  const config = enhancers.reduce((config, enhancer) => enhancer(config), schemaConfig);

  return new Schema(config);
};
