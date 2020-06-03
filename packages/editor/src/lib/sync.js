//
// Copyright 2020 Wireline, Inc.
//

import { ySyncPluginKey, ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from "y-prosemirror";
import ColorHash from 'color-hash';

import Provider from "./provider";

const colorHash = new ColorHash();

const createSyncTextPlugin = (doc, onLocalUpdate) => {
  doc.on('update', (update, origin) => {
    const local = origin === ySyncPluginKey; // This is a y-prosemirror thing

    if (!local) return;

    onLocalUpdate(update, doc);
  });

  // Content sync plugin
  const syncPlugin = ySyncPlugin(doc.getXmlFragment('content'));

  return syncPlugin;
};

const cursorBuilder = user => {
  const cursor = window.document.createElement('span');
  cursor.className = 'cursor';
  cursor.style.borderColor = user.color;

  const cursorName = window.document.createElement('span');
  cursorName.className = 'name';
  cursorName.style.backgroundColor = user.color;
  cursorName.innerText = user.name;

  cursor.appendChild(cursorName);

  return cursor;
};

const createStatusPlugin = (id, doc, status) => {
  const provider = new Provider(doc);

  // Send updates out
  provider.on('local-update', status.onLocalUpdate);

  // Initial state
  provider.awareness.setLocalStateField(
    'user',
    { id, color: colorHash.hex(id) }
  );

  // Cursor indicator plugin
  const plugin = yCursorPlugin(provider.awareness, ({ cursorBuilder }));

  const handler = {
    processRemoteUpdate: provider.processRemoteUpdate.bind(provider),
    setUserName: (name) => {
      provider.awareness.setLocalStateField('user', { ...provider.awareness.getLocalState(), name });
    }
  };

  return { plugin, handler };
};

export const createSyncPlugins = (options, plugins, keysToMap) => {

  const { id, doc, status, onLocalUpdate = () => null } = options;

  const syncPlugin = createSyncTextPlugin(doc, onLocalUpdate);
  const { plugin: statusPlugin, handler: statusHandler } = createStatusPlugin(id, doc, status);
  const undoPlugin = yUndoPlugin({ trackedOrigins: [({}).constructor] });

  plugins.push(
    syncPlugin,
    statusPlugin,
    undoPlugin
  );

  keysToMap['Mod-z'] = undo;
  keysToMap['Mod-y'] = redo;
  keysToMap['Mod-Shift-z'] = redo;

  return {
    status: statusHandler
  };
};
