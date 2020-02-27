//
// Copyright 2020 Wireline, Inc.
//

import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';

import * as mutex from 'lib0/mutex';
import { Observable } from 'lib0/observable';
import * as Y from 'yjs'; // eslint-disable-line
import * as time from 'lib0/time';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const messageSync = 0;
const messageQueryAwareness = 3;
const messageAwareness = 1;
const messageAuth = 2;

const readMessage = (provider, buf, emitSynced) => {
  const decoder = decoding.createDecoder(buf);
  const encoder = encoding.createEncoder();
  const messageType = decoding.readVarUint(decoder);

  switch (messageType) {
    case messageSync:
      encoding.writeVarUint(encoder, messageSync);

      // eslint-disable-next-line no-case-declarations
      const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, provider.doc, provider);
      if (emitSynced && syncMessageType === syncProtocol.messageYjsSyncStep2 && !provider.synced) {
        provider.synced = true;
      }
      break;

    case messageQueryAwareness:
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          provider.awareness,
          Array.from(provider.awareness.getStates().keys())
        )
      );
      break;

    case messageAwareness:
      awarenessProtocol.applyAwarenessUpdate(
        provider.awareness,
        decoding.readVarUint8Array(decoder),
        provider
      );
      break;

    case messageAuth:
      // TODO(burdon): ?
      // authProtocol.readAuthMessage(decoder, provider, permissionDeniedHandler);
      console.warn('messageAuth');
      break;

    default:
      console.error('Invalid message:', messageType);
      return encoder;
  }

  return encoder;
};

const broadcastMessage = (provider, buf) => {
  provider.channel.send(buf);
};

/**
 * TODO(burdon): Comment.
 */
class Provider extends Observable {
  lastMessageReceived = 0;

  constructor(doc, channel) {
    super();
    this.doc = doc;
    this.channel = channel;
    this.awareness = new awarenessProtocol.Awareness(this.doc);

    // TODO(burdon): Not used?
    this.mux = mutex.createMutex();

    /**
     * Listens to Yjs updates and sends them to remote peers (via ws and broadcastchannel).
     * @param {Uint8Array} update
     * @param {any} origin
     */
    this._updateHandler = (update, origin) => {
      if (origin !== this || origin === null) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeUpdate(encoder, update);

        broadcastMessage(this, encoding.toUint8Array(encoder));
      }
    };

    this._awarenessUpdateHandler = (/* { added, updated, removed }, origin */) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, [doc.clientID])
      );

      broadcastMessage(this, encoding.toUint8Array(encoder));
    };

    window.addEventListener('beforeunload', () => {
      // Broadcast message with local awareness state set to null (indicating disconnect).
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          this.awareness,
          [this.doc.clientID],
          new Map()
        )
      );

      broadcastMessage(this, encoding.toUint8Array(encoder));
    });

    this.awareness.on('change', this._awarenessUpdateHandler);

    this.channel.on('remote', remoteData => {
      // decode UInt8Array
      const data = new Uint8Array(Array.from(Object.values(remoteData)));
      this.lastMessageReceived = time.getUnixTime();
      const encoder = readMessage(this, new Uint8Array(data), true);
      if (encoding.length(encoder) > 1) {
        channel.send(encoding.toUint8Array(encoder));
      }
    });
  }
}

export default Provider;
