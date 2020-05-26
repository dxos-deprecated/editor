//
// Copyright 2020 Wireline, Inc.
//

import { ySyncPlugin, yCursorPlugin, ySyncPluginKey } from 'y-prosemirror';
import { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';
import ColorHash from 'color-hash';

const colorHash = new ColorHash();

const cursorBuilder = user => {
  const cursor = window.document.createElement('span');
  cursor.className = 'cursor';
  cursor.style.borderColor = user.color;

  const cursorName = document.createElement('span');
  cursorName.className = 'name';
  cursorName.style.backgroundColor = user.color;
  cursorName.innerText = user.name;

  cursor.appendChild(cursorName);

  return cursor;
};



const buildSyncPlugin = (doc, { onDocUpdate = () => null }) => {

  const docUpdateHandler = (update, origin, doc) => {
    if (origin === ySyncPluginKey) {
      // Local update
      onDocUpdate(update, 'local', doc);
    }
  };

  doc.on('update', docUpdateHandler);

  const syncPlugin = ySyncPlugin(doc.getXmlFragment('content'));

  return syncPlugin;
};

const buildCursorPlugin = (awareness, { id, cursor: { getUsername } }) => {
  // Initial local user state
  awareness.setLocalStateField('user', { id, color: colorHash.hex(id), name: getUsername() });

  const cursorPlugin = yCursorPlugin(awareness, { cursorBuilder });

  return cursorPlugin;
};

export const syncPlugins = (options) => {
  if (!options.id) {
    return [];
  }

  const { channel, signaling, doc = new Doc() } = options;

  const provider = new WebrtcProvider(channel, doc, { signaling });

  if (process.env.NODE_ENV === 'development') {
    window.provider = provider;
  }

  const syncPlugin = buildSyncPlugin(doc, options);
  const cursorPlugin = buildCursorPlugin(provider.awareness, options);

  return [
    syncPlugin,
    cursorPlugin
  ];
};
