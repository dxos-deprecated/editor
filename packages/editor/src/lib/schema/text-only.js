//
// Copyright 2020 Wireline, Inc.
//

import { nodes as schemaBasicNodes } from 'prosemirror-schema-basic';

export const createSchemaSpec = () => {
  return {
    nodes: {
      doc: {
        content: 'paragraph'
      },
      paragraph: schemaBasicNodes.paragraph,
      text: schemaBasicNodes.text
    }
  };
};

export const createInitialDoc = schema => {
  return schema.node('doc', null, [
    schema.node('paragraph', null)
  ]);
};
