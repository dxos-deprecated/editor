//
// Copyright 2019 Wireline, Inc.
//

import { Schema } from 'prosemirror-model';

const pDOM = ["p", 0];
const brDOM = ["br"];

const nodes = {
  // :: NodeSpec The top level document node.
  doc: {
    content: "block+"
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM: function toDOM() { return pDOM; }
  },

  // :: NodeSpec The text node.
  text: {
    group: "inline"
  },

  // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM: function toDOM() { return brDOM; }
  }
};

const marks = {};

const schema = new Schema({
  nodes,
  marks
});

export default schema;