//
// Copyright 2020 Wireline, Inc.
//

import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';

import fullSchema from './schema/full';
import { syncPlugins } from './sync';

export const createProsemirrorView = (domElement, {
  schema = fullSchema,
  sync
} = {}) => {

  let plugins = [];

  // Sync setup
  plugins.push(...syncPlugins(sync));

  // Base setup
  plugins.push(...exampleSetup({
    schema,
    menuBar: false
  }));

  plugins = plugins.filter(Boolean);

  const view = new EditorView(
    { mount: domElement },
    {
      state: EditorState.create({
        doc: schema.node('doc', null, [
          schema.node('paragraph', null, [])
        ]),
        plugins
      })
    }
  );

  return view;
};
