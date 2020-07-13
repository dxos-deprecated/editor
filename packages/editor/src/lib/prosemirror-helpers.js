//
// Copyright 2020 DXOS.org
//

import { lift } from 'prosemirror-commands';
import { wrapInList } from 'prosemirror-schema-list';
import { findParentNode } from 'prosemirror-utils';

const isListPredicate = state => node => [
  state.schema.nodes.bullet_list,
  state.schema.nodes.ordered_list
].includes(node.type);

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
    $from.parent.hasMarkup(type, attrs)
  );
};

export const canToggleList = listNodeType => state => {
  if (isFirstChildOnItemList(state) && !isListItemOfType(listNodeType)(state)) {
    return false;
  }

  return toggleList(listNodeType)(state);
};

export const isListItemOfType = listNodeType => state => {
  const parents = [];
  const parentListResult = findParentNode(node => {
    parents.push(node);
    return node.type === listNodeType;
  })(state.selection);

  return Boolean(parentListResult) && parents.length <= 3;
};

export const isFirstChildOnItemList = state => {
  const parents = [];
  const result = findParentNode(node => {
    parents.push(node);
    return node.type === state.schema.nodes.list_item;
  })(state.selection);

  if (!result) return false;

  const directParent = parents[0];

  return result.node.firstChild.eq(directParent);
};

export const isDirectChildOfList = state => {
  const parents = [];
  const result = findParentNode(node => {
    parents.push(node);
    return isListPredicate(state)(node);
  })(state.selection);

  return result && parents.length <= 3;
};

export const isEmptyListItem = state => {
  return (
    state.schema.nodes.list_item &&
    state.selection.empty &&
    state.selection.$from.parent.type === state.schema.nodes.paragraph &&
    state.selection.$from.parent.textContent === '' &&
    isDirectChildOfList(state)
  );
};

export const getListType = state => {
  const result = findParentNode(isListPredicate(state))(state.selection);

  if (!result) return null;

  return result.node.type;
};

export const markActive = type => state => {
  const { from, $from, to, empty } = state.selection;

  return empty
    ? type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type);
};

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

export const getSelectedTextNodes = state => {
  const { from, to } = state.selection;
  const nodes = [];

  state.doc.nodesBetween(from, to, node => {
    if (node.isText) nodes.push(node);
    return true;
  });

  return nodes;
};

export const toggleList = listNodeType => {
  return (state, dispatch) => {
    // Test if can build a different list type
    const canMakeOtherList = !isListItemOfType(listNodeType)(state) && !isFirstChildOnItemList(state);
    const shouldRemoveList = !canMakeOtherList && lift(state);
    // const shouldChangeListType = shouldRemoveList && !isListItemOfType(listNodeType)(state);

    if (shouldRemoveList) {
      return lift(state, dispatch);
      // if (shouldChangeListType) {
      //   wrapInList(listNodeType)(state, dispatch);
      // }
    }

    return wrapInList(listNodeType)(state, dispatch);
  };
};

export const getSelectedNodes = (state, filter = () => true) => {
  const { from, to } = state.selection;
  const nodes = [];

  state.doc.nodesBetween(from, to, node => {
    if (filter(node)) nodes.push(node);
    return true;
  });

  return nodes;
};

export const nodeIsChildOf = (node, parentNode) => {
  let found = false;

  parentNode.descendants(childNode => {
    if (childNode.eq(node)) {
      found = true;
    }

    return false;
  });

  return found;
};

export const isLink = schema => node => {
  return schema.marks.link ? schema.marks.link.isInSet(node.marks) : false;
};

export const linkMark = schema => node => {
  return node.marks.find(mark => mark.type === schema.marks.link);
};
