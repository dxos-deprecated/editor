//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';
import faker from 'faker';
import * as Y from 'yjs';
// import { Transform } from 'prosemirror-transform';

import { createProsemirrorView } from '@wirelineio/prosemirror-pad/src/lib/prosemirror-view';
import { withLogView } from '@wirelineio/appkit';

class RandomText extends Component {

  peers = [];

  insertRandomText = peerIndex => {
    const { randomPosition, sentences } = this.props;

    this.ydoc.transact(() => {

      const text = faker.lorem.paragraph(sentences);

      const transaction = this.view.state.tr;

      const position = randomPosition ? Math.floor(Math.random() * transaction.doc.content.size) : 0;

      transaction.insertText(text, position);

      const newState = this.view.state.apply(transaction);

      this.view.updateState(newState);

      this.peers[peerIndex] = {
        timeout: this.buildTimeout(peerIndex)
      };
    });
  }

  disableAutoText = () => {
    this.peers = this.peers.reduce((peers, peer) => {
      clearTimeout(peer.timeout);
      return [];
    }, []);
  }

  enableAutoText = () => {
    const { peers } = this.props;

    this.disableAutoText();

    this.peers = Array.from({ length: peers }).map((x, i) => {
      return {
        timeout: this.buildTimeout(i)
      };
    });
  }

  handleLocalDocUpdate = (update, origin) => {
    const { appendChange } = this.props;

    // Do not reply to incoming remote changes.
    if (origin === 'remote') return;

    appendChange(`${JSON.stringify({ clientID: this.ydoc.clientID, type: 'update', data: update })}\n`);
    // console.log('>> OUT', { clientID: this.ydoc.clientID, type: 'update', data: update });
  }

  buildTimeout = i => setTimeout(() => this.insertRandomText(i), this.delayBetweenInsertions());

  delayBetweenInsertions = () => {
    const { randomDelay, delay } = this.props;

    const toDelay = randomDelay ? Math.floor(Math.random() * randomDelay) + 500 : delay;

    return toDelay;
  }

  componentDidMount() {
    this.ydoc = new Y.Doc();

    this.view = createProsemirrorView(document.getElementById('hidden-random-editor'), this.ydoc);

    this.ydoc.on('update', this.handleLocalDocUpdate);
  }

  componentDidUpdate() {
    const { enabled } = this.props;

    enabled ? this.enableAutoText() : this.disableAutoText();
  }

  shouldComponentUpdate(nextProps) {
    const propsToDiff = [
      'enabled',
      'randomPosition',
      'randomDelay',
      'sentences',
      'delay',
      'peers'
    ];

    return propsToDiff.some(propName => this.props[propName] !== nextProps[propName]);
  }

  render() {
    return (
      <div id="hidden-random-editor" style={{ display: 'none' }} />
    );
  }
}

export default withLogView({ view: 'prosemirror' })(RandomText);
