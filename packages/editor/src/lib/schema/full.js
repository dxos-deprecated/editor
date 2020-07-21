//
// Copyright 2020 DXOS.org
//

import { Schema } from 'prosemirror-model';
import { nodes, marks } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';

import { underlineMark, blockReactElementNode, inlineReactElementNode } from './common';

export const createSchema = () => {
  const schemaSpec = {
    nodes: {
      ...nodes,

      block_react_element: blockReactElementNode,
      inline_react_element: inlineReactElementNode
    },

    marks: {
      em: marks.em,
      strong: marks.strong,
      code: marks.code,
      underline: underlineMark
    }
  };

  const schema = new Schema(schemaSpec);

  return new Schema({
    nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
    marks: schema.spec.marks
  });
};

export const createInitialDoc = schema => {
  return schema.node('doc', null, [
    schema.node('paragraph', null, [])
  ]);
};
