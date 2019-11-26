//
// Copyright 2019 Wireline, Inc.
//

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { exampleSetup } from 'prosemirror-example-setup';

import { yUndoPlugin, undo, redo } from 'y-prosemirror';
import { yCursorPlugin } from '../plugins/cursor-plugin';

import { schema } from './schema';
import Provider from './provider';
import YjsProsemirrorBinding from '../plugins/yjs-prosemirror-binding';
import contextMenuPlugin from '../plugins/context-menu-plugin';
import ContextMenu from '../components/ContextMenu';

export const createProsemirrorView = ({
  element,
  doc,
  contentSync,
  statusSync,
  contextMenu,
  options: { initialFontSize = 16 }
}) => {
  const yjsBinding = new YjsProsemirrorBinding(contentSync.channel, doc);

  const provider = new Provider(yjsBinding.doc, statusSync.channel);

  provider.awareness.setLocalStateField('user', {
    id: statusSync.id,
    username: statusSync.getUsername()
  });

  const state = EditorState.create({
    schema,

    plugins: [
      // Content sync plugin
      yjsBinding.plugin,

      // Cursor indicator plugin
      yCursorPlugin(provider.awareness, statusSync),

      // Yjs history plugin
      yUndoPlugin(),

      contextMenuPlugin({
        MenuComponent: ContextMenu,
        getOptions: contextMenu.getOptions,
        onSelect: contextMenu.onSelect,
        renderItem: contextMenu.renderItem
      })
    ].concat(
      exampleSetup({
        menuBar: false,
        history: false,
        schema,
        mapKeys: {
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
        }
      })
    )
  });

  const view = new EditorView(
    { mount: element },
    {
      state,
      dispatchTransaction(transaction) {
        const oldState = view.state;
        const newState = oldState.apply(transaction);

        view.updateState(newState);

        return { oldState, newState };
      }
    }
  );

  return view;
};
