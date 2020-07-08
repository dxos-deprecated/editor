//
// Copyright 2020 DXOS.org
//

import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { SourceCodeEditor } from '../src';

import { styles } from './styles';

class CollaborativeSourceCodeEditor extends Component {
  static count = 0;

  state = {
    peers: undefined
  };

  componentDidMount () {
    const { peers: peersCount = 1 } = this.props;

    const peerId = `peer-${peersCount - 1}`;
    const peers = [];

    // First peer with sync message
    peers[peerId] = this.createPeer(peerId);

    for (let index = 0; index < peersCount - 1; index++) {
      const peerId = `peer-${index}`;
      peers[peerId] = this.createPeer(peerId);
    }

    this.setState({ peers });
  }

  createPeer = peerId => {
    const onLocalUpdate = update => {
      const { peers } = this.state;

      Object.values(peers)
        .filter(peer => peer.id !== peerId)
        .forEach(peer => {
          // New origin: avoid loop
          peer.editor.sync.processRemoteUpdate(update, { author: peerId });
        });
    };

    const onLocalStatusUpdate = (update) => {
      const { peers } = this.state;

      Object.values(peers)
        .filter(peer => peer.id !== peerId)
        .forEach(peer => {
          if (!peer.editor) return;
          peer.editor.sync.status.processRemoteUpdate(update);
        });
    };

    const onEditorCreated = editor => {
      const { peers } = this.state;

      const newPeers = { ...peers };
      newPeers[peerId].editor = editor;

      // Set peer name for status
      editor.sync.status.setUserName(peers[peerId].username);

      this.setState({ peers: newPeers });
    };

    return {
      id: peerId,
      username: peerId,
      onEditorCreated,
      onLocalUpdate,
      onLocalStatusUpdate
    };
  };

  render () {
    const { classes, language } = this.props;
    const { peers } = this.state;

    if (!peers) {
      return 'Loading...';
    }

    const components = Object.values(peers).map((peer, index) => {
      const { onEditorCreated: handleEditorCreated } = peer;
      return (
        <div key={peer.id} className={classes.container}>
          <SourceCodeEditor
            language={language}
            onCreated={handleEditorCreated}
            sync={{
              id: peer.id,
              onLocalUpdate: peer.onLocalUpdate,
              status: {
                onLocalUpdate: peer.onLocalStatusUpdate
              }
            }}
          />
        </div>
      );
    });

    return (
      <div className={classes.root}>
        {components}
      </div>
    );
  }
}

export default withStyles(styles)(CollaborativeSourceCodeEditor);
