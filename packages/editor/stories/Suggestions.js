//
// Copyright 2020 DXOS.org
//

import React, { Component } from 'react';
import { TextSelection } from 'prosemirror-state';

import { Editor } from '../src';

class Suggestions extends Component {
  handleGetOptions = (query = '') => {
    return [
      { id: 1, label: 'Ana' },
      { id: 2, label: 'María' },
      { id: 3, label: 'Roberto' },
      { id: 4, label: 'Juan' }
    ].filter(option => option.label.toLowerCase().includes(query.toLowerCase()));
  };

  handleSelect = (option, view, start, end) => {
    const { tr } = view.state;

    const textNode = view.state.selection.$anchor.nodeBefore;
    const textSelection = TextSelection.create(view.state.doc, view.state.selection.anchor - (textNode.nodeSize - 1), view.state.selection.head);

    textSelection.replaceWith(tr, view.state.schema.text(option.label));

    view.dispatch(tr);
  };

  handleRenderItem = (option) => {
    return `${option.id} - ${option.label}`;
  };

  render () {
    return (
      <Editor
        suggestions={{
          getOptions: this.handleGetOptions,
          onSelect: this.handleSelect,
          renderMenuItem: this.handleRenderItem
        }}
      />
    );
  }
}

export default Suggestions;
