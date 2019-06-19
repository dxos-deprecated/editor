/* eslint-disable no-console */

import React, { Component } from 'react';

import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import { prosemirrorPlugin } from 'y-prosemirror';
import * as Y from 'yjs';

import './styles/prosemirror.css';
import { schema } from './schema';

import cursorPlugin from './cursor-plugin';
import LogProvider from './y-log-provider';

class ProsemirrorPad extends Component {
  view = null;
  ydoc = null;
  editorContainer = React.createRef();

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

    logsToApply.forEach(log => {
      const { clientID, update, cursor } = JSON.parse(log);

      // If not a self change.
      if (clientID !== this.ydoc.clientID) {
        console.log('IN <<<', { clientID, update, cursor });

        if (cursor) {
          // Cursor info update;
          this.handleRemoteCursorUpdate(cursor);
        } else {
          // Doc update
          this.handleRemoteDocUpdate(update);
        }
      }
    });
  }

  handleLocalDocUpdate = (update, origin) => {
    const { appendChange } = this.props;

    // Do not reply to incoming remote changes
    if (origin === 'remote') return;

    appendChange(`${JSON.stringify({ clientID: this.ydoc.clientID, update })}\n`);
    console.log('>> OUT', { clientID: this.ydoc.clientID, update });
  }

  handleRemoteDocUpdate = update => {
    Y.applyUpdate(this.ydoc, update, 'remote');
  }

  handleLocalCursorUpdate = update => {
    const { appendChange } = this.props;

    appendChange(`${JSON.stringify({ clientID: this.ydoc.clientID, cursor: update })}\n`);
    console.log('>> OUT', { clientID: this.ydoc.clientID, cursor: update });
  }

  handleRemoteCursorUpdate = update => {
    this.logProvider.receiveUpdate(update);
  }

  createDocument = (itemId, username) => {
    this.destroyDocument();

    // this.ydoc = new Y.Doc({ clientID: username });
    this.ydoc = new Y.Doc();
    // this.ydoc.clientID = username;

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
          .concat([pPlugin, cursorPlugin(this.logProvider.awareness)])
      }),
    });

    this.ydoc.on('update', this.handleLocalDocUpdate);

    this.logProvider.start();

    window.logProvider = this.logProvider;
  }

  destroyDocument = () => {
    if (this.view) this.view.destroy();

    if (!this.ydoc) return;

    this.ydoc.off('update', this.handleLocalDocUpdate);

    this.ydoc.destroy();
  }

  componentDidMount() {
    const { itemId, logs, username } = this.props;

    this.createDocument(itemId, username);

    logs.forEach(log => {
      const { clientID, update, cursor } = JSON.parse(log);

      // If not a self change.
      if (clientID !== this.ydoc.clientID) {
        console.log('IN <<<', { clientID, update, cursor });

        if (cursor) {
          // Cursor info update;
          this.handleRemoteCursorUpdate(cursor);
        } else {
          // Doc update
          this.handleRemoteDocUpdate(update);
        }

      }
    });
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id="editor-prosemirror" ref={this.editorContainer} />
    );
  }
}

export default ProsemirrorPad;
