//
// Copyright 2019 Wireline, Inc.
//

import { Node } from 'prosemirror-model'; // eslint-disable-line no-unused-vars
import { EditorView } from 'prosemirror-view'; // eslint-disable-line no-unused-vars
import { schema } from './schema';

/**
 *
 * @param {Node} type
 * @param {Object} attrs
 */
export const blockActive = (type, attrs = {}) => state => {
  const { $from, to, node } = state.selection;

  if (node) {
    return node.hasMarkup(type, attrs);
  }

  return to <= $from.end() &&
    $from.parent.hasMarkup(type) &&
    Object.keys(attrs).every(name => $from.parent.attrs[name] === attrs[name]);
};

/**
 *
 * @param {Node} type
 */
export const markActive = type => state => {
  const { from, $from, to, empty } = state.selection;

  return empty
    ? type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type);
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
