//
// Copyright 2019 Wireline, Inc.
//

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { exampleSetup } from 'prosemirror-example-setup';

import {
  yUndoPlugin,
  undo,
  redo,
  yCursorPlugin,
  yUndoPluginKey
} from '../plugins/y-prosemirror/y-prosemirror';

import { schema } from './schema';
import Provider from './provider';
import YjsProsemirrorBinding from '../plugins/yjs-prosemirror-binding';

const getActiveMarks = state => {
  return Object.values(schema.marks).reduce((marks, mark) => {
    const ref = state.selection;
    const { from } = ref;
    const { $from } = ref;
    const { to } = ref;
    const { empty } = ref;

    let active = false;

    if (empty) {
      active = mark.isInSet(state.storedMarks || $from.marks());
    } else {
      active = state.doc.rangeHasMark(from, to, mark);
    }

    marks[mark.name] = active;

    return marks;
  }, {});
};

export const createProsemirrorView = ({
  element,
  doc,
  changes,
  status,
  onChange = () => null,
  onHistoryChange = () => null,
  options: { initialFontSize = 16 }
}) => {
  const yjsBinding = new YjsProsemirrorBinding(changes.channel, doc);

  const provider = new Provider(yjsBinding.doc, status.channel);

  provider.awareness.setLocalStateField('user', {
    id: status.id,
    username: status.getUsername()
  });

  const state = EditorState.create({
    schema,

    plugins: [
      yjsBinding.plugin,
      yCursorPlugin(provider.awareness, status),
      yUndoPlugin(),
      keymap({
        'Mod-z': undo,
        'Mod-y': redo,
        'Mod-Shift-z': redo,

        'Mod-=': (state, dispatch, view) => {
          const current = parseInt(
            parseFloat(view.dom.style.fontSize || initialFontSize),
            10
          );

          view.dom.style.fontSize = `${current + 1}px`;
          return true;
        },
        'Mod--': (state, dispatch, view) => {
          const current = parseInt(
            parseFloat(view.dom.style.fontSize || initialFontSize),
            10
          );

          view.dom.style.fontSize = `${current - 1}px`;
          return true;
        },

        Tab: (state, dispatch) => {
          const {
            $from: { pos: from },
            $to: { pos: to }
          } = state.selection;

          dispatch(
            state.tr
              .delete(from, to)
              .insert(from, schema.text('  '))
              .scrollIntoView()
          );

          return true;
        }
      })
    ].concat(exampleSetup({ menuBar: false, history: false, schema }))
  });

  const view = new EditorView(
    { mount: element },
    {
      state,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);

        view.updateState(newState);

        const activeMarks = getActiveMarks(newState);

        onChange({ transaction, view, activeMarks });
      }
    }
  );

  const { undoManager } = yUndoPluginKey.getState(view.state);

  undoManager.on('stack-item-added', ({ type }, undoManager) => {
    const canUndo = undoManager.undoStack.length > 0;
    const canRedo = undoManager.redoStack.length > 0;
    onHistoryChange({ type, canUndo, canRedo });
  });

  window.view = view;

  return {
    view,
    history: {
      undo: () => undo(view.state),
      redo: () => redo(view.state)
    }
  };
};
