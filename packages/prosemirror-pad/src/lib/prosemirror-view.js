import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { exampleSetup } from "prosemirror-example-setup";

import { ySyncPlugin, yUndoPlugin, undo, redo } from "y-prosemirror";

import schema from './schema';

export const createProsemirrorView = (element, doc) => {
  const sharedType = doc.getXmlFragment('prosemirror');

  const view = new EditorView(element, {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(sharedType),
        yUndoPlugin,
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo
        })
      ].concat(exampleSetup({ schema, menuBar: false, history: false }))
    }),
  });


  return view;
};
