//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';
import * as Y from 'yjs';

import { withStyles } from '@material-ui/core/styles';

import { Channel, Editor } from '../src';

import { styles } from './styles';

class Collaborative extends Component {
  static count = 0;

  state = {
    editors: undefined
  };

  componentDidMount() {
    const { editorsCount = 1 } = this.props;

    const editors = Array.from({ length: editorsCount }).reduce((editors, current, index) => {
      const id = 'editor-' + index;
      editors[id] = this.createEditor(id, `user-${index}`);
      return editors;
    }, {});

    this.setState({ editors });
  }

  createEditor = (id, username) => {
    // View's doc mock.
    const doc = new Y.Doc();

    const contentChannel = new Channel();
    const statusChannel = new Channel();

    contentChannel.on('local', data => {
      const { editors } = this.state;

      // Update view's doc.
      Y.applyUpdate(doc, data.update, data.origin);

      Object.values(editors)
        .filter(editor => editor.id !== id)
        .forEach(editor => {
          editor.contentChannel.receive({ ...data, author: editor.id });
        });
    });

    contentChannel.on('remote', data => {
      // Update view's doc.
      Y.applyUpdate(doc, data.update, data.origin);
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

    if (!id) {
      return editors[editorId].username;
    }

    return editors[id].username;
  };

  handleCreated = editorId => ({ view }) => {
    const { editors } = this.state;

    const newEditors = { ...editors };
    newEditors[editorId].view = view;

    this.setState({ editors: newEditors });
  };

  render() {
    const { classes } = this.props;
    const { editors } = this.state;

    if (!editors) {
      return 'Loading...';
    }

    const components = Object.values(editors).map(editor => (
      <div key={editor.id} className={classes.container}>
        <Editor
          schema="full"
          onCreated={this.handleCreated(editor.id)}
          toolbar
          sync={{
            doc: editor.doc,
            content: {
              channel: editor.contentChannel
            },
            status: {
              id: editor.id,
              getUsername: this.handleGetUsername(editor.id),
              channel: editor.statusChannel
            }
          }}
        />
      </div>
    ));

    return (
      <div className={classes.root}>
        {components}
      </div>
    );
  }
}

export default withStyles(styles)(Collaborative);