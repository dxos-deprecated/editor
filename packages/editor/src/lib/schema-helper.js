//
// Copyright 2019 Wireline, Inc.
//

import { EditorState } from 'prosemirror-state'; // eslint-disable-line

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
