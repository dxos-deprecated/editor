/* eslint-disable no-console */

import React, { Component } from 'react';

import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import { prosemirrorPlugin } from 'y-prosemirror';
import * as Y from 'yjs';

import './styles/prosemirror.css';
import { schema } from './schema';

import cursorPlugin from './lib/prosemirror-cursor-plugin';
import LogProvider from './lib/yjs-log-provider';
import { withStyles } from '@material-ui/core';

class ProsemirrorPad extends Component {
  view = null;
  ydoc = null;
  usernames = new Map();
  editorContainer = React.createRef();

  componentDidMount() {
    const { itemId, logs, username } = this.props;

    this.createDocument(itemId, username);

    this.applyChangesFromLogs(logs);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    const { itemId, logs = [], username } = nextProps;
    const { itemId: prevItemId, logs: prevLogs = [] } = this.props;

    if (itemId === undefined) {
      return null;
    }

    let logsToApply = [];

    if (itemId !== prevItemId) {
      this.createDocument(itemId, username);
      logsToApply = [...logs];
    } else if (logs.length !== prevLogs.length) {
      logsToApply = logs.slice(prevLogs.length);
    }

    this.applyChangesFromLogs(logsToApply);
  }

  applyChangesFromLogs(logs = []) {
    logs.forEach(log => {
      const { clientID, type, data } = JSON.parse(log);

      // If not a self change.
      if (clientID !== this.ydoc.clientID) {
        // console.log('IN <<<', { clientID, type, data });

        switch (type) {
          case 'update':
            // Doc update
            this.handleRemoteDocUpdate(data);
            break;

          case 'cursor':
            // Cursor info update
            this.handleRemoteCursorUpdate(data);
            break;

          case 'username':
            // ClientID => Username update
            this.handleRemoteUsernameUpdate(clientID, data);
            break;

          default:
            break;
        }
      }
    });
  }

  getUsernameByClientID = clientID => {
    return this.usernames.get(clientID);
  }

  handleRemoteUsernameUpdate = (clientID, username) => {
    this.usernames.set(clientID, username);
  }

  handleLocalDocUpdate = (update, origin) => {
    const { appendChange } = this.props;

    // Do not reply to incoming remote changes
    if (origin === 'remote') return;

    appendChange(`${JSON.stringify({ clientID: this.ydoc.clientID, type: 'update', data: update })}\n`);
    // console.log('>> OUT', { clientID: this.ydoc.clientID, update });
  }

  handleRemoteDocUpdate = update => {
    Y.applyUpdate(this.ydoc, update, 'remote');
  }

  handleLocalCursorUpdate = update => {
    const { appendChange } = this.props;

    appendChange(`${JSON.stringify({ clientID: this.ydoc.clientID, type: 'cursor', data: update })}\n`);
    // console.log('>> OUT', { clientID: this.ydoc.clientID, cursor: update });
  }

  handleRemoteCursorUpdate = update => {
    this.logProvider.receiveUpdate(update);
  }

  createDocument = (itemId, username) => {
    const { appendChange } = this.props;

    this.destroyDocument();

    this.usernames = new Map();

    this.ydoc = new Y.Doc();

    this.usernames.set(this.ydoc.clientID, username);

    appendChange(`${JSON.stringify({ clientID: this.ydoc.clientID, type: 'username', data: username })}\n`);

    const type = this.ydoc.get('prosemirror', Y.XmlFragment);

    const pPlugin = prosemirrorPlugin(type);

    this.logProvider = new LogProvider(
      itemId,
      this.ydoc,
      this.handleLocalCursorUpdate
    );

    this.view = new EditorView(this.editorContainer.current, {
      state: EditorState.create({
        schema,
        plugins: exampleSetup({ schema })
          .concat([pPlugin, cursorPlugin(this.logProvider.awareness, this.getUsernameByClientID)])
      }),
    });

    this.ydoc.on('update', this.handleLocalDocUpdate);

    this.logProvider.start();

    window.logProvider = this.logProvider;
  }

  destroyDocument = () => {
    this.usernames = null;

    if (this.view) this.view.destroy();

    if (!this.ydoc) return;

    this.ydoc.off('update', this.handleLocalDocUpdate);

    this.ydoc.destroy();
  }

  render() {
    const { classes } = this.props;
    return (
      <div ref={this.editorContainer} className={classes.editor} />
    );
  }
}

const styles = () => ({
  editor: {
    margin: '0.1rem',
    backgroundColor: '#fafafa',
    border: '1px solid #a5a5a5',
    padding: '0.2rem',
    display: 'inline-table'
  }
});

export default withStyles(styles)(ProsemirrorPad);
