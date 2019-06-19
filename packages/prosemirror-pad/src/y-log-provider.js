/* eslint-disable no-console */

// import * as Y from 'yjs';
import * as bc from 'lib0/broadcastchannel.js';
import * as encoding from 'lib0/encoding.js';
import * as decoding from 'lib0/decoding.js';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import * as mutex from 'lib0/mutex.js';
import * as syncProtocol from 'y-protocols/sync.js';
import * as authProtocol from 'y-protocols/auth.js';
import { Observable } from 'lib0/observable.js';

const messageSync = 0;
const messageQueryAwareness = 3;
const messageAwareness = 1;
const messageAuth = 2;

class LogProvider extends Observable {
  /**
   * @param {Y.Doc} doc
   */
  constructor(itemId, doc, sendUpdate, awareness = new awarenessProtocol.Awareness(doc)) {

    super();

    window.addEventListener('beforeunload', () => {
      // awarenessProtocol.removeAwarenessStates(this.awareness, [this.doc.clientID], null);
    });

    this.itemId = itemId;
    this.doc = doc;
    this.sendUpdate = sendUpdate;
    this.awareness = awareness;
    this.mux = mutex.createMutex();
    this.originMark = new Date().getTime();
  }

  start = () => {
    this.awareness.on('change', this._awarenessUpdateHandler);

    if (this.awareness.getLocalState() === null) {
      this.awareness.setLocalState({ cursor: {} });
    }

    bc.subscribe(this.itemId, this._bcSubscriber);

    this.mux(() => {
      // write sync step 1
      const encoderSync = encoding.createEncoder();
      encoding.writeVarUint(encoderSync, messageSync);
      syncProtocol.writeSyncStep1(encoderSync, this.doc);
      bc.publish(this.itemId, encoding.toUint8Array(encoderSync));
      // write queryAwareness
      const encoderAwareness = encoding.createEncoder();
      encoding.writeVarUint(encoderAwareness, messageQueryAwareness);
      bc.publish(this.itemId, encoding.toUint8Array(encoderAwareness));
    });

    this.doc.on('update', this._updateHandler);
  }

  /**
 * @param {ArrayBuffer} data
 */
  receiveUpdate = data => {
    const encoder = readMessage(this, new Uint8Array(Object.values(data)));
    if (encoding.length(encoder) > 1) {
      this.sendUpdate(encoding.toUint8Array(encoder));
    }
  }

  /**
   * @param {ArrayBuffer} data
   */
  _bcSubscriber = data => {
    this.mux(() => {
      const encoder = readMessage(this, new Uint8Array(data));
      if (encoding.length(encoder) > 1) {
        bc.publish(this.itemId, encoding.toUint8Array(encoder));
      }
    });
  };

  /**
   * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
   * @param {Uint8Array} update
   * @param {any} origin
   */
  _updateHandler = (update, origin) => {
    if (origin !== this.originMark || origin === null) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const buf = encoding.toUint8Array(encoder);

      this.sendUpdate(buf);

      this.mux(() => {
        bc.publish(this.itemId, buf);
      });
    }
  };

  /**
   * @param {any} changed
   * @param {any} origin
   */
  _awarenessUpdateHandler = ({ added, updated, removed }) => {
    // only broadcast local awareness information and when ws connected
    const predicate = /** @param {number} id */ id => id === this.doc.clientID;

    if (added.some(predicate) || updated.some(predicate) || removed.some(predicate)) {
      const encoder = encoding.createEncoder();

      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.doc.clientID]));

      const buf = encoding.toUint8Array(encoder);

      this.sendUpdate(buf);

      this.mux(() => {
        bc.publish(this.itemId, buf);
      });
    }
  };
}


/**
 * @param {WebsocketProvider} provider
 * @param {Uint8Array} buf
 * @return {encoding.Encoder}
 */
const readMessage = (provider, buf) => {
  const decoder = decoding.createDecoder(buf);
  const encoder = encoding.createEncoder();
  const messageType = decoding.readVarUint(decoder);
  switch (messageType) {
    case messageSync:
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.readSyncMessage(decoder, encoder, provider.doc, provider.originMark);
      break;
    case messageQueryAwareness:
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(provider.awareness, Array.from(provider.awareness.getStates().keys())));
      break;
    case messageAwareness:
      awarenessProtocol.applyAwarenessUpdate(provider.awareness, decoding.readVarUint8Array(decoder), provider);
      break;
    case messageAuth:
      authProtocol.readAuthMessage(decoder, provider, permissionDeniedHandler);
      break;
    default:
      console.error('Unable to compute message');
      return encoder;
  }
  return encoder;
};

/**
 * @param {WebsocketProvider} provider
 * @param {string} reason
 */
const permissionDeniedHandler = (provider, reason) => console.warn(`Permission denied to access ${provider.url}.\n${reason}`);


export default LogProvider;