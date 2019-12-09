//
// Copyright 2019 Wireline, Inc.
//

import ReactDOM from 'react-dom';

class ReactElementNodeView {
  constructor(node, view, getPos) {
    // We'll need these later
    this.node = node;
    this.outerView = view;
    this.getPos = getPos;

    // The node's representation in the editor (empty, for now)
    this.dom = document.createElement('reactelement');

    ReactDOM.render(node.render(), this.dom);
  }
}

export default ReactElementNodeView;
