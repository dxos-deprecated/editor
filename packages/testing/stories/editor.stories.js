import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import * as Y from 'yjs';

import Editor from '@wirelineio/editor';
import Channel from '@wirelineio/editor/channel';

import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';

const FullViewport = story => (
  <div style={{ width: '100%', height: '500px', display: 'flex' }}>
    {story()}
  </div>
);

const MuiTheme = story => (
  <MuiThemeProvider>
    <CssBaseline />
    {story()}
  </MuiThemeProvider>
);

class BasicEditor extends Component {
  render() {
    const {
      id,
      doc,
      contentChannel,
      statusChannel,
      onGetUsername
    } = this.props;

    if (!doc) return 'Loading...';

    return (
      <Editor
        doc={doc}
        changes={{
          channel: contentChannel
        }}
        status={{
          id,
          getUsername: onGetUsername,
          channel: statusChannel
        }}
        contextMenu={{
          getOptions: this.handleEditorContextMenuGetOptions,
          onSelect: this.handleEditorContextMenuOptionSelect,
          renderItem: this.handleEditorContextMenuRenderItem
        }}
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
    const contentChannel = new Channel({ debug: `CONTENT ${id}` });
    const statusChannel = new Channel({ debug: `STATUS ${id}` });

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

  render() {
    const { editors } = this.state;

    if (!editors) return 'Loading...';

    return Object.values(editors).map(editor => {
      return (
        <BasicEditor
          key={editor.id}
          onGetUsername={this.handleGetUsername(editor.id)}
          {...editor}
        />
      );
    });
  }
}

storiesOf('Editor', module)
  .addDecorator(MuiTheme)
  .addDecorator(FullViewport)
  .add('Basic', () => <BasicSync editorsCount={2} />);
