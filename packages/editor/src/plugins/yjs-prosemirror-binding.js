//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';
import { ySyncPlugin } from 'y-prosemirror';
import { getXmlFragmentContent } from '../lib/yjs-helpers';

// eslint-disable-next-line no-unused-vars
import Channel from '../lib/channel';

/**
 * Prosemirror binding to sync document (Y.Doc) changes through generic channel
 */
class YjsProsemirrorBinding {
  /** @type {Y.Doc} */
  _doc = new Y.Doc();

  /** @type {Channel} */
  _channel = undefined;

  /** @type {ySyncPlugin} */
  _plugin = undefined;

  /**
   *
   * @param {Channel} channel
   * @param {Y.Doc} remoteDoc
   */
  constructor(channel, remoteDoc) {
    this._channel = channel;

    // Clone doc content: remote -> local
    Y.applyUpdate(this._doc, Y.encodeStateAsUpdate(remoteDoc));

    this._doc.on('update', this._localDocUpdateHandler);

    // Remote updates listener
    this._channel.on('remote', this._remoteDocUpdateHandler);

    // Y.XmlFragment as a rich text content
    const contentFragment = getXmlFragmentContent(this._doc);

    this._plugin = ySyncPlugin(contentFragment);
  }

  destroy = () => {
    this._doc.off('update', this._localDocUpdateHandler);
    this._channel.off('remote', this._remoteDocUpdateHandler);
  };

  _remoteDocUpdateHandler = ({ update, author }) => {
    const origin = { author };
    Y.applyUpdate(this._doc, update, origin);
  };

  _localDocUpdateHandler = (update, origin) => {
    if (origin === null || origin instanceof Y.UndoManager) {
      // Prosemirror change
      this._channel.send({ update });
    }
  };

  get doc() {
    return this._doc;
  }

  get plugin() {
    return this._plugin;
  }
}

export default YjsProsemirrorBinding;
