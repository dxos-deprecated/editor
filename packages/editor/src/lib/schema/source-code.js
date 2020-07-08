//
// Copyright 2020 DXOS.org
//

import { nodes } from 'prosemirror-schema-basic';

export const createSchemaSpec = ({ language }) => {
  return {
    nodes: {
      doc: {
        content: 'code_block'
      },
      code_block: {
        ...nodes.code_block,
        attrs: {
          class: { default: `hljs ${language}` }
        },
        toDOM: node => ['pre', ['code', { class: node.attrs.class }, 0]]
      },
      text: nodes.text
    }
  };
};

export const createInitialDoc = (schema, { language }) => {
  return schema.node('doc', null, [
    schema.node('code_block', { class: `hljs ${language}` })
  ]);
};
