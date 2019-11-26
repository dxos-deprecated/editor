//
// Copyright 2019 Wireline, Inc.
//

import { Node } from 'prosemirror-model'; // eslint-disable-line no-unused-vars
import { EditorView } from 'prosemirror-view'; // eslint-disable-line no-unused-vars
import { schema } from './schema';

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

window.getSelectedNodes = getSelectedTextNodes;
window.isLink = isLink;
window.linkMark = linkMark;