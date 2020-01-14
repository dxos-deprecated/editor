//
// Copyright 2019 Wireline, Inc.
//

import ReactDOM from 'react-dom';

const nodeTypeName = 'reactelement';

class ReactElementNodeView {
  constructor(node, render) {
    this.node = node;

    // The node's representation in the editor (empty, for now).
    this.dom = document.createElement(nodeTypeName);

    ReactDOM.render(render(node), this.dom);
  }
}

export const reactElement = schemaConfig => {
  schemaConfig.nodes[nodeTypeName] = {
    group: 'inline',
    content: 'inline*',
    inline: true,
    atom: true,

    parseDOM: [
      {
        tag: nodeTypeName
      }
    ],

    toDOM: () => {
      return [nodeTypeName, {}, 0];
    },

    // https://github.com/ProseMirror/prosemirror-markdown#class-markdownserializer
    toMarkdown: state => {
      state.write(`__REACT_ELEMENT__`);
    }
  };

  return schemaConfig;
};

export const buildReactElementNodeView = render => node => {
  return new ReactElementNodeView(node, render);
};
