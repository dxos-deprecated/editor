//
// Copyright 2020 DXOS.org
//

import { nodes, marks } from 'prosemirror-schema-basic';

import { underlineMark, inlineReactElementNode } from './common';

export const createSchemaSpec = () => {
  return {
    nodes: {
      doc: nodes.doc,
      paragraph: nodes.paragraph,
      text: nodes.text,
      hard_break: nodes.hard_break,
      inline_react_element: inlineReactElementNode
    },

    marks: {
      em: marks.em,
      strong: marks.strong,
      link: marks.link,
      code: marks.code,
      underline: underlineMark
    }
  };
};

export const createInitialDoc = schema => {
  return schema.node('doc', null, [
    schema.node('paragraph', null, [])
  ]);
};
