//
// Copyright 2020 Wireline, Inc.
//

import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Editor } from '../src';

import { styles } from './styles';

import { Doc, applyUpdate, encodeStateAsUpdate } from 'yjs';

class Collaborative extends Component {
  static count = 0;

  state = {
    peers: undefined
  };

  componentDidMount() {
    const { peers: peersCount = 1 } = this.props;

    const peerId = `peer-${peersCount - 1}`;
    const peers = [];

    // First peer with sync message
    peers[peerId] = this.createPeer(peerId);
    const originalDoc = peers[peerId].doc;

    for (let index = 0; index < peersCount - 1; index++) {
      const peerId = 'peer-' + index;
      peers[peerId] = this.createPeer(peerId, originalDoc);
    }

    this.setState({ peers });
  }

  createPeer = (peerId, originalDoc = null) => {

    const doc = new Doc();

    if (originalDoc) {
      applyUpdate(doc, encodeStateAsUpdate(originalDoc));
    }

    const onLocalUpdate = update => {
      const { peers } = this.state;

      Object.values(peers)
        .filter(peer => peer.id !== peerId)
        .forEach(peer => {
          // New origin: avoid loop
          applyUpdate(peer.doc, update, { author: peerId });
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
      doc,
      onEditorCreated,
      onLocalUpdate,
      onLocalStatusUpdate
    };
  };

  handleGetUsername = peerId => id => {
    const { peers } = this.state;

    if (!id) {
      return peers[peerId].username;
    }

    return peers[id].username;
  };

  render() {
    const { classes } = this.props;
    const { peers } = this.state;

    if (!peers) {
      return 'Loading...';
    }

    const components = Object.values(peers).map(peer => (
      <div key={peer.id} className={classes.container}>
        <Editor
          schema="full"
          onCreated={peer.onEditorCreated}
          toolbar
          sync={{
            id: peer.id,
            doc: peer.doc,
            onLocalUpdate: peer.onLocalUpdate,
            status: {
              onLocalUpdate: peer.onLocalStatusUpdate
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