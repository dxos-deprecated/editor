//
// Copyright 2020 Wireline, Inc.
//

import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';

import { Observable } from 'lib0/observable';
import * as time from 'lib0/time';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const messageSync = 0;
const messageQueryAwareness = 3;
const messageAwareness = 1;

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

    default:
      console.error('Invalid message:', messageType);
      return encoder;
  }

  return encoder;
};

/**
 * Communication provider to send/receive status updates.
 */
class Provider extends Observable {
  lastMessageReceived = 0;

  constructor (doc) {
    super();
    this.doc = doc;
    this.awareness = new awarenessProtocol.Awareness(this.doc);

    window.addEventListener('beforeunload', this.disconnect);

    this.awareness.on('change', this._awarenessUpdateHandler);
  }

  _awarenessUpdateHandler = () => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.doc.clientID])
    );

    this.emit('local-update', [encoding.toUint8Array(encoder)]);
  };

  disconnect = () => {
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

    this.emit('local-update', [encoding.toUint8Array(encoder)]);
  }

  processRemoteUpdate = update => {
    const data = new Uint8Array(Array.from(Object.values(update)));
    this.lastMessageReceived = time.getUnixTime();
    const encoder = readMessage(this, new Uint8Array(data), true);
    if (encoding.length(encoder) > 1) {
      this.emit('local-update', [encoding.toUint8Array(encoder)]);
    }
  }
}

export default Provider;
