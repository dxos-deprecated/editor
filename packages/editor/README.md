# Editor


## Helpers
YJS helpers to handle editor content.

### `getXmlFragmentContent(doc: Y.Doc) => XmlFragment`
Get XmlFragment that holds document content.

### `getContentAsMarkdown(doc: Y.Doc) => string`
Get document content as markdown string.

### `registerContentObserver(doc: Y.Doc, callback: function)`
Add a listener (callback function) for content changes.

### `unregisterContentObserver(doc: Y.Doc, callback: function)`
Remove callback function listener for content changes.

## Channel
EventEmitter based channel for share/sync data.

### Usage

```javascript
import Channel from '@wirelineio/editor/Channel';

const contentChannel = new Channel();

contentChannel.on('local', data => {
  console.log(data);
});

contentChannel.on('remote', data => {
  console.log(data);
});

contentChannel.send({ some: 'local data' });
// Console: 'local data'

contentChannel.receive({ some: 'remote data' });
// Console: 'remote data'
```

## Editor

### Usage

```javascript
import React, { Component } from 'react';
import * as Y from 'yjs';

import Editor from '@wirelineio/editor/Editor';
import Channel from '@wirelineio/editor/Channel';

import { withStyles } from '@material-ui/core/styles';

import { grey } from '@material-ui/core/colors';

import ListItemText from '@material-ui/core/ListItemText';

const style = () => ({
  contextMenuItemText: {
    fontSize: 12,
    padding: 0
  },

  contextMenuItemTextRight: {
    float: 'right',
    marginLeft: 5,
    color: grey[500],
    textTransform: 'Capitalize'
  }
});

class BasicEditor extends Component {
  render() {
    const {
      id,
      doc,
      contentChannel,
      statusChannel,
      onGetUsername,
      onContextMenuGetOptions,
      onContextMenuOptionSelect,
      onContextMenuRenderItem
    } = this.props;

    if (!doc) return 'Loading...';

    return (
      <Editor
        sync={{
          doc: doc,
          content: {
            channel: contentChannel
          },
          status: {
            id,
            getUsername: onGetUsername,
            channel: statusChannel
          }
        }}
        contextMenu={{
          getOptions: onContextMenuGetOptions,
          onSelect: onContextMenuOptionSelect,
          renderItem: onContextMenuRenderItem
        }}
        nodeViews={nodeViews}
        schemaEnhancers={schemaEnhancers}
        onViewCreated={onViewCreated}
      />
    );
  }
}

class BasicSync extends Component {
  state = {
    editors: undefined
  };

  componentDidMount() {
    const { editorsCount } = this.props;

    const editors = Array.from({ length: editorsCount }).reduce(
      (editors, _, idx) => {
        editors[idx] = this.createEditor(idx, `editor-${idx}`);
        return editors;
      },
      {}
    );

    this.setState({ editors });
  }

  createEditor = (id, username) => {
    const doc = new Y.Doc();
    const contentChannel = new Channel();
    const statusChannel = new Channel();

    contentChannel.on('local', data => {
      const { editors } = this.state;

      Object.values(editors)
        .filter(editor => editor.id !== id)
        .forEach(editor => {
          editor.contentChannel.receive({ ...data, author: editor.id });
        });
    });

    statusChannel.on('local', data => {
      const { editors } = this.state;

      Object.values(editors)
        .filter(editor => editor.id !== id)
        .forEach(editor => {
          editor.statusChannel.receive(data);
        });
    });

    return {
      id,
      username,
      doc,
      contentChannel,
      statusChannel
    };
  };

  handleGetUsername = editorId => id => {
    const { editors } = this.state;

    if (!id) return editors[editorId].username;

    return editors[id].username;
  };

  handleContextMenuGetOptions = () => {
    return [
      { id: 1, label: 'Insert some text' },
      { id: 2, label: 'Insert some text 2' }
    ];
  };

  handleContextMenuRenderItem = ({ option }) => {
    const { classes } = this.props;

    return (
      <ListItemText
        primary={<>{option.label}</>}
        className={classes.contextMenuItemText}
      />
    );
  };

  handleContextMenuOptionSelect = async (option, view) => {
    const { tr } = view.state;

    view.state.selection.replaceWith(tr, view.state.schema.text('-SOME TEXT-'));

    view.dispatch(tr);
  };

  render() {
    const { editors } = this.state;

    if (!editors) return 'Loading...';

    return Object.values(editors).map(editor => {
      return (
        <BasicEditor
          key={editor.id}
          onGetUsername={this.handleGetUsername(editor.id)}
          onContextMenuGetOptions={this.handleContextMenuGetOptions}
          onContextMenuOptionSelect={this.handleContextMenuOptionSelect}
          onContextMenuRenderItem={this.handleContextMenuRenderItem}
          {...editor}
        />
      );
    });
  }
}
```
