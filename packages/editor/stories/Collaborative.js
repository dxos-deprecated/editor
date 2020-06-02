//
// Copyright 2020 Wireline, Inc.
//

import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Channel, Editor } from '../src';

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

    const statusChannel = new Channel();
    statusChannel.on('local', data => {
      const { peers } = this.state;

      Object.values(peers)
        .filter(peer => peer.id !== peerId)
        .forEach(peer => {
          peer.statusChannel.receive(data);
        });
    });

    return {
      id: peerId,
      username: peerId,
      doc,
      onLocalUpdate,
      statusChannel
    };
  };

  handleGetUsername = peerId => id => {
    const { peers } = this.state;

    if (!id) {
      return peers[peerId].username;
    }

    return peers[id].username;
  };

  handleCreated = peerId => ({ view }) => {
    const { peers } = this.state;

    const newPeers = { ...peers };
    newPeers[peerId].view = view;

    this.setState({ peers: newPeers });
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
          onCreated={this.handleCreated(peer.id)}
          toolbar
          sync={{
            doc: peer.doc,
            onLocalUpdate: peer.onLocalUpdate,
            status: {
              channel: peer.statusChannel,
              getUsername: this.handleGetUsername(peer.id)
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