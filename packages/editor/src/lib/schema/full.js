//
// Copyright 2020 DXOS.org
//

import { Schema } from 'prosemirror-model';
import { nodes, marks } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';

import { underlineMark } from './common';

export const createSchema = () => {
  const schemaSpec = {
    nodes: {
      ...nodes,

      react_element: {
        group: 'inline',
        inline: true,
        selectable: true,
        attrs: {
          props: { default: null }
        },
        parseDOM: [
          {
            tag: 'reactelement',
            getAttrs (dom) {
              return {
                id: dom.getAttribute('id'),
                props: JSON.parse(decodeURI(dom.getAttribute('props')))
              };
            }
          }
        ],

        toDOM: node => {
          return ['reactelement', {
            id: node.attrs.id,
            props: encodeURI(JSON.stringify(node.attrs.props))
          }];
        }
      }
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
