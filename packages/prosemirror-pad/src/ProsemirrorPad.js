//
// Copyright 2019 Wireline, Inc.
//

/* eslint-disable no-console */

import React, { Component } from 'react';

import * as Y from 'yjs';

import { withStyles } from '@material-ui/core';

import { createProsemirrorView } from './lib/prosemirror-view';

class ProsemirrorPad extends Component {
  view = null;
  ydoc = null;
  editorContainer = React.createRef();

  componentDidMount() {
    const { itemId, logs } = this.props;

    this.createDocument(itemId);

    this.applyChangesFromLogs(logs);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    const { itemId, logs = [] } = nextProps;
    const { itemId: prevItemId, logs: prevLogs = [] } = this.props;

    if (itemId === undefined) {
      return null;
    }

    let logsToApply = [];

    if (itemId !== prevItemId) {
      this.createDocument(itemId);
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
            // Doc update.
            this.handleRemoteDocUpdate(data);
            break;

          case 'cursor':
            // Cursor info update.
            // this.handleRemoteCursorUpdate(data);
            break;

          case 'username':
            // ClientID => Username update.
            // this.handleRemoteUsernameUpdate(clientID, data);
            break;

          default:
            break;
        }
      }
    });
  }

  handleLocalDocUpdate = (update, origin) => {
    const { appendChange } = this.props;

    // Do not reply to incoming remote changes.
    if (origin === 'remote') return;

    appendChange(`${JSON.stringify({ clientID: this.ydoc.clientID, type: 'update', data: update })}\n`);
    // console.log('>> OUT', { clientID: this.ydoc.clientID, update });
  }

  handleRemoteDocUpdate = update => {
    Y.applyUpdate(this.ydoc, update, 'remote');
  }

  createDocument = () => {
    this.destroyDocument();

    this.ydoc = new Y.Doc();

    this.view = createProsemirrorView(this.editorContainer.current, this.ydoc);

    this.ydoc.on('update', this.handleLocalDocUpdate);
  }

  destroyDocument = () => {
    if (this.view) this.view.destroy();

    if (!this.ydoc) return;

    this.ydoc.off('update', this.handleLocalDocUpdate);

    this.ydoc.destroy();
  }

  render() {
    const { classes } = this.props;
    return (
      <code ref={this.editorContainer} className={classes.editor} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
    );
  }
}

const styles = theme => ({
  editor: {
    margin: '0.1rem',
    backgroundColor: '#fafafa',
    border: '1px solid #a5a5a5',
    padding: '1rem',
    display: 'inline-table',
    width: '80%',
    marginTop: `${theme.spacing.unit * 4}px`,
    marginBottom: `${theme.spacing.unit * 4}px`,
    height: `calc(100% - ${theme.spacing.unit * 8}px)`,

    '& > .ProseMirror': {
      height: '100%',
      outline: 'none'
    },

    '& > .ProseMirror > p:first-of-type': {
      marginBlockStart: 0
    },

    '& > .ProseMirror > p:last-of-type': {
      marginBlockEnd: 0
    }
  }
});

export default withStyles(styles)(ProsemirrorPad);
