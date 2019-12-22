//
// Copyright 2019 Wireline, Inc.
//

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { exampleSetup } from 'prosemirror-example-setup';

import { yUndoPlugin, undo, redo } from 'y-prosemirror';

import { yCursorPlugin } from '../plugins/cursor-plugin';
import YjsProsemirrorBinding from '../plugins/yjs-prosemirror-binding';
import contextMenuPlugin from '../plugins/context-menu-plugin';

import ContextMenu from '../components/ContextMenu';

import { createSchema } from './schema';
import Provider from './provider';

export const createProsemirrorView = ({
  element,
  doc,
  contentSync,
  statusSync,
  contextMenu,
  nodeViews = {},
  schemaEnhancers = [],
  options: { initialFontSize = 16 }
}) => {
  const yjsBinding = new YjsProsemirrorBinding(contentSync.channel, doc);

  const provider = new Provider(yjsBinding.doc, statusSync.channel);

  provider.awareness.setLocalStateField('user', {
    id: statusSync.id,
    username: statusSync.getUsername()
  });

  const schema = createSchema(schemaEnhancers);

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
      }),

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
    ].concat(
      exampleSetup({
        menuBar: false,
        history: false,
        schema
      })
    )
  });

  const view = new EditorView(
    { mount: element },
    {
      state,
      nodeViews,
      handleClickOn(view, pos, node, nodePos, event) {
        // Handle link ctrl+click.
        if (
          event.target.nodeName === 'A' &&
          event.ctrlKey &&
          event.target.href
        ) {
          window.open(event.target.href, '_blank');
          return true;
        }

        return false;
      },
      dispatchTransaction(transaction) {
        const oldState = view.state;
        const newState = oldState.apply(transaction);

        // TODO(burdon): Error when navigating away from markdown export story.
        /*
          index.es.js:4477 Uncaught TypeError: Cannot read property 'matchesNode' of null
          at EditorView.updateStateInner (index.es.js:4477)
          at EditorView.updateState (index.es.js:4454)
          at EditorView.dispatchTransaction (prosemirror-view.js:133)
          at EditorView.dispatch (index.es.js:4704)
          at cursor-plugin.js:141
        */
        try {
          view.updateState(newState);
        } catch (err) {
          console.error(err);
        }

        return { oldState, newState };
      }
    }
  );

  return view;
};
