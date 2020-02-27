import React, { Component } from 'react';

import { Editor } from '../src';

class ContextMenu extends Component {
  handleContextMenuGetOptions = () => {
    return Math.random() > 0.5 ? [
      { subheader: 'First subheader' },
      { id: 1, label: 'Item 1' },
      { id: 2, label: 'Item 2' },
      { subheader: 'Second subheader' },
      { id: 3, label: 'Item 3' },
      { id: 4, label: 'Item 4' }
    ] : [];
  };

  handleContextMenuRenderItem = (option) => {
    return `${option.id} - ${option.label}`;
  };

  handleContextMenuOptionSelect = async (option, view) => {
    const { tr } = view.state;

    view.state.selection.replaceWith(tr, view.state.schema.text(option.label));

    view.dispatch(tr);
  };

  render() {
    return (
      <Editor
        contextMenu={{
          getOptions: this.handleContextMenuGetOptions,
          onSelect: this.handleContextMenuOptionSelect,
          renderMenuItem: this.handleContextMenuRenderItem,
          emptyOptionsLabel: 'NO OPTIONS HERE TO SHOW',
          visibleItems: 3,
          triggerMenuEventKeys: ['@', '#', '$']
        }}
      />
    );
  }
}

export default ContextMenu;
