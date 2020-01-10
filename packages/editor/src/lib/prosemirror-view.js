//
// Copyright 2019 Wireline, Inc.
//

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { exampleSetup } from 'prosemirror-example-setup';

import { yUndoPlugin, undo as yUndo, redo as yRedo } from 'y-prosemirror';

import { yCursorPlugin } from '../plugins/cursor-plugin';
import YjsProsemirrorBinding from '../plugins/yjs-prosemirror-binding';
import contextMenuPlugin from '../plugins/context-menu-plugin';

import ContextMenu from '../components/ContextMenu';

import { createSchema } from './schema';
import Provider from './provider';
import { baseKeymap } from 'prosemirror-commands';
import { DOMSerializer } from 'prosemirror-model';

export const createProsemirrorView = (element, {
  sync = false,
  contextMenu = false,
  nodeViews = {},
  schemaEnhancers = {},
  basic = true,
  onContentChange = console.log,
  options = {}
} = {}) => {

  const { initialFontSize = 16 } = options;

  const plugins = [];

  const useBasicSchema = sync ? false : basic;
  const schema = createSchema(schemaEnhancers, useBasicSchema);

  const serializer = DOMSerializer.fromSchema(schema);

  const keysToMap = {
    ...baseKeymap,
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
  };

  if (sync) {
    const { content, status, doc } = sync;

    const yjsBinding = new YjsProsemirrorBinding(content.channel, doc);

    const provider = new Provider(yjsBinding.doc, status.channel);

    provider.awareness.setLocalStateField('user', {
      id: status.id,
      username: status.getUsername()
    });

    plugins.push(
      // Content sync plugin
      yjsBinding.plugin,

      // Cursor indicator plugin
      yCursorPlugin(provider.awareness, status),

      // Yjs history plugin
      yUndoPlugin()
    );

    keysToMap['Mod-z'] = yUndo;
    keysToMap['Mod-y'] = yRedo;
    keysToMap['Mod-Shift-z'] = yRedo;
  }

  if (contextMenu) {
    plugins.push(
      contextMenuPlugin({
        MenuComponent: ContextMenu,
        getOptions: contextMenu.getOptions,
        onSelect: contextMenu.onSelect,
        renderItem: contextMenu.renderItem
      })
    );
  }

  plugins.push(keymap(keysToMap));

  const state = EditorState.create({
    schema,
    plugins: plugins.concat(
      exampleSetup({
        menuBar: false,
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

        try {
          view.updateState(newState);
        } catch (err) {
          console.error(err);
        }

        if (transaction.docChanged) {
          const contentContainer = document.createElement('div');
          serializer.serializeFragment(newState.doc.content, { document }, contentContainer);
          onContentChange(contentContainer.innerHTML);
        }

        return { oldState, newState };
      }
    }
  );

  return view;
};
