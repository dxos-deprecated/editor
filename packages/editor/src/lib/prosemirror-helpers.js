//
// Copyright 2019 Wireline, Inc.
//

import { Node } from 'prosemirror-model'; // eslint-disable-line no-unused-vars
import { EditorView } from 'prosemirror-view'; // eslint-disable-line no-unused-vars
import { schema } from './schema';

/**
 *
 * @param {EditorState} state
 */
export const getActiveMarks = state => {
  return Object.values(schema.marks).reduce((marks, mark) => {
    const ref = state.selection;
    const { from } = ref;
    const { $from } = ref;
    const { to } = ref;
    const { empty } = ref;

    let active = false;

    if (empty) {
      active = mark.isInSet(state.storedMarks || $from.marks());
    } else {
      active = state.doc.rangeHasMark(from, to, mark);
    }

    marks[mark.name] = active;

    return marks;
  }, {});
};

/**
 *
 * @param {EditorView} view
 */
export const getSelectedTextNodes = view => {
  const { from, to } = view.state.selection;
  const nodes = [];

  view.state.doc.nodesBetween(from, to, node => {
    if (node.isText) nodes.push(node);
    return true;
  });

  return nodes;
};

/**
 *
 * @param {Node} node
 */
export const isLink = node => {
  return schema.marks.link.isInSet(node.marks);
};

/**
 *
 * @param {Node} node
 */
export const linkMark = node => {
  return node.marks.find(mark => mark.type === schema.marks.link);
};
