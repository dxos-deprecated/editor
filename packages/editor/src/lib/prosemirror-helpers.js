//
// Copyright 2020 Wireline, Inc.
//

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

  return (
    to <= $from.end() &&
    $from.parent.hasMarkup(type) &&
    Object.keys(attrs).every(name => $from.parent.attrs[name] === attrs[name])
  );
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
 * @param {Node} type
 */
export const canInsert = type => state => {
  const { $from } = state.selection;

  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d);

    if ($from.node(d).canReplaceWith(index, index, type)) {
      return true;
    }
  }

  return false;
};

/**
 *
 * @param {EditorState} state
 */
export const getSelectedTextNodes = state => {
  const { from, to } = state.selection;
  const nodes = [];

  state.doc.nodesBetween(from, to, node => {
    if (node.isText) nodes.push(node);
    return true;
  });

  return nodes;
};

/**
 *
 * @param {Node} node
 */
export const isLink = schema => node => {
  return schema.marks.link ? schema.marks.link.isInSet(node.marks) : false;
};

/**
 *
 * @param {Node} node
 */
export const linkMark = schema => node => {
  return node.marks.find(mark => mark.type === schema.marks.link);
};
