//
// Copyright 2020 Wireline, Inc.
//

import { Schema } from 'prosemirror-model';

import * as basic from './basic';
import * as full from './full';
import * as textOnly from './text-only';
import * as sourceCode from './source-code';

const schemaConfigs = {
  basic,
  full,
  'text-only': textOnly,
  'source-code': sourceCode
};

const createSchema = (schemaName, options) => {
  const { createSchema, createSchemaSpec, createInitialDoc } = schemaConfigs[schemaName];

  const schema = createSchema ? createSchema() : new Schema(createSchemaSpec(options));

  return {
    schema,
    initialDoc: createInitialDoc(schema, options)
  };
};

export default createSchema;
