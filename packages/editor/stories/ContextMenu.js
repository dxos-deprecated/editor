import React, { Component } from 'react';

import ListItemText from '@material-ui/core/ListItemText';

import { Editor } from '../src';

class ContextMenu extends Component {
  handleContextMenuGetOptions = () => {
    return [
      { id: 1, label: 'Item 1' },
      { id: 2, label: 'Item 2' }
    ];
  };

  handleContextMenuRenderItem = ({ option }) => {
    return (
      <ListItemText
        primary={<>{option.label}</>}
      />
    );
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
          renderItem: this.handleContextMenuRenderItem
        }}
      />
    );
  }
}

export default ContextMenu;
