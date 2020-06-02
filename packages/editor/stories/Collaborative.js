//
// Copyright 2020 Wireline, Inc.
//

import React, { useState, useCallback, useEffect, useRef, Fragment } from 'react';

import { uuidv4 } from 'lib0/random';
import { Doc } from 'yjs';

import { Button } from '@material-ui/core';

import { Editor } from '../src';

let last = 0;
const getUpdates = (all = false) => {
  const updates = JSON.parse(localStorage.getItem('updates') || '[]');

  if (all) return updates;

  const lastUpdates = updates.slice(last);
  last = updates.length;
  return lastUpdates;
};

const setUpdate = (update, origin) => {
  localStorage.setItem('updates', JSON.stringify([...getUpdates(true), { update, origin }]));
};

const Collaborative = () => {

  const [doc, setDoc] = useState(null);
  const [connected, setConnected] = useState(true);
  const [id] = useState(`peer-id-${uuidv4()}`);
  const editor = useRef(null);

  const handleCursorGetUsername = useCallback(peerId => {
    return peerId || id;
  }, [id]);

  const handleEditorCreated = useCallback(editorInstance => {
    editor.current = editorInstance;
  }, []);

  const handleDocUpdate = useCallback((update, origin) => {
    if (origin === 'local') {
      setUpdate(update, { id });
    }
  }, [id]);

  const handleRemoteUpdate = useCallback(() => {
    if (!doc) return;
    // getUpdates().forEach(({ update, origin }) => {
    //   console.log('applying remote update');
    //   applyUpdate(doc, Uint8Array.from(Object.values(update)), origin);
    // });
  }, [doc]);

  useEffect(() => {
    const doc = new Doc();

    doc.on('update', (_, origin) => console.log('DOC UPDATE', origin, doc.store.clients));

    // getUpdates().forEach(({ update }) => {
    //   console.log('applying remote update from init');
    //   doc.transact(() => {
    //     applyUpdate(doc, Uint8Array.from(Object.values(update)));
    //   }, 'init');
    // });

    setDoc(doc);

    window.addEventListener('storage', handleRemoteUpdate);

    return () => {
      window.removeEventListener('storage', handleRemoteUpdate);
    };
  }, []);

  const handleToggleConnect = useCallback(() => {
    if (!window.provider) return;

    if (window.provider.shouldConnect) {
      window.provider.disconnect();
      setConnected(false);
    } else {
      window.provider.connect();

      // Once connected again apply missed updates
      // setTimeout(() => {
      //   getUpdates().forEach(({ update }) => {
      //     console.log('applying remote update after re-connect');
      //     applyUpdate(doc, Uint8Array.from(Object.values(update)), 'init');
      //   });
      // }, 3000);

      setConnected(true);
    }
  }, [window.provider, doc]);

  if (!doc) return null;

  return (
    <Fragment>
      <Button onClick={handleToggleConnect}>{connected ? 'Disconnect' : 'Connect'}</Button>
      <Editor
        sync={{
          id,
          channel: 'some-channel',
          // signaling: ['ws://localhost:4000'],
          doc,
          onDocUpdate: handleDocUpdate,
          cursor: {
            getUsername: handleCursorGetUsername
          }
        }}
        onCreated={handleEditorCreated}
      />
    </Fragment>
  );
};

export default Collaborative;

// class Collaborative extends Component {
//   state = {
//     peers: undefined
//   };

//   componentDidMount() {
//     const { peers: peersCount = 0 } = this.props;

//     const peerId = `peer-${Date.now()}`;
//     // const peerId = `peer-${peersCount - 1}`;
//     const peers = [];

//     // First peer with sync message
//     peers[peerId] = this.createPeer(peerId);
//     const originalDocument = peers[peerId].document;

//     for (let index = 0; index < peersCount - 1; index++) {
//       const peerId = 'peer-' + index;
//       peers[peerId] = this.createPeer(peerId, originalDocument);
//     }

//     this.setState({ peers });
//   }

//   createPeer = (peerId, originalDocument = null) => {

//     const document = new Document();

//     if (originalDocument) {
//       document.applyUpdate(originalDocument.docState);
//     }

//     document.on('update', ({ update, origin }) => {
//       const { peers } = this.state;

//       const local = origin === ySyncPluginKey; // This is a y-prosemirror thing

//       if (!local) return;

//       Object.values(peers)
//         .filter(peer => peer.id !== peerId)
//         .forEach(peer => {
//           // New origin: avoid loop
//           peer.document.applyUpdate(update, { author: peerId });
//         });
//     });

//     const statusChannel = new Channel();
//     statusChannel.on('local', data => {
//       const { peers } = this.state;

//       Object.values(peers)
//         .filter(peer => peer.id !== peerId)
//         .forEach(peer => {
//           peer.statusChannel.receive(data);
//         });
//     });

//     return {
//       id: peerId,
//       username: peerId,
//       document,
//       statusChannel
//     };
//   };

//   handleGetUsername = peerId => id => {
//     const { peers } = this.state;

//     if (!id) {
//       return peers[peerId].username;
//     }

//     return peers[id].username;
//   };

//   handleCreated = peerId => ({ view }) => {
//     const { peers } = this.state;

//     const newPeers = { ...peers };
//     newPeers[peerId].view = view;

//     this.setState({ peers: newPeers });
//   };

//   render() {
//     const { classes } = this.props;
//     const { peers } = this.state;

//     if (!peers) {
//       return 'Loading...';
//     }

//     const components = Object.values(peers).map(peer => (
//       <div key={peer.id} className={classes.container}>
//         <Editor
//           schema="full"
//           onCreated={this.handleCreated(peer.id)}
//           toolbar
//           sync={{
//             id: peer.id,
//             document: peer.document,
//             status: {
//               channel: peer.statusChannel,
//               getUsername: this.handleGetUsername(peer.id)
//             }
//           }}
//         />
//       </div>
//     ));

//     return (
//       <div className={classes.root}>
//         {components}
//       </div>
//     );
//   }
// }

// export default withStyles(styles)(Collaborative);

