//
// Copyright 2020 Wireline, Inc.
//

import { nodes, marks } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';

import { underlineMark } from './common';
import { Schema } from 'prosemirror-model';

export const createSchema = () => {
  const schemaSpec = {
    nodes: {
      ...nodes,

      react_element: {
        group: 'inline',
        content: 'inline*',
        inline: true,
        atom: true,
        attrs: {
          props: { default: null }
        },
        parseDOM: [
          {
            tag: 'reactelement',
            getAttrs (dom) {
              return {
                props: JSON.parse(decodeURI(dom.getAttribute('props')))
              };
            }
          }
        ],

        toDOM: node => {
          return ['reactelement', {
            props: encodeURI(JSON.stringify(node.attrs.props))
          }, 0];
        }
      }
    },

    marks: {
      ...marks,
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
