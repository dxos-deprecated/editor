//
// Copyright 2020 Wireline, Inc.
//

export const nodes = {
  doc: {
    content: 'inline*'
  },

  text: {
    group: 'inline'
  },

  hard_break: {
    inline: true,
    group: 'inline',
    selectable: true,
    parseDOM: [{ tag: 'br' }],
    toDOM () {
      return ['br'];
    }
  }
};

export const marks = {};

export default { nodes, marks };
