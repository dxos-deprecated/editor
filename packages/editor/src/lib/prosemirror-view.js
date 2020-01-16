//
// Copyright 2019 Wireline, Inc.
//

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { exampleSetup } from 'prosemirror-example-setup';
import { baseKeymap } from 'prosemirror-commands';
import { DOMSerializer, DOMParser } from 'prosemirror-model';
import { history, undo, redo } from 'prosemirror-history';

import { yUndoPlugin, undo as yUndo, redo as yRedo } from '../plugins/yjs-undo-plugin';

import { yCursorPlugin } from '../plugins/cursor-plugin';
import YjsProsemirrorBinding from '../plugins/yjs-prosemirror-binding';
import contextMenuPlugin from '../plugins/context-menu-plugin';

import ContextMenu from '../components/ContextMenu';

import { createSchema } from './schema';
import Provider from './provider';
import historyListenerPlugin from '../plugins/history-listener-plugin';


export const defaultViewProps = {
  schema: 'basic',
  htmlContent: undefined,
  contextMenu: false,
  sync: false,
  nodeViews: {},
  schemaEnhancers: [],
  options: {},
  onContentChange: false,
  onKeyDown: false
};

export const createProsemirrorView = (element, {
  schema: customSchema,
  htmlContent,
  contextMenu,
  sync,
  nodeViews,
  schemaEnhancers,
  options,
  onContentChange,
  onKeyDown
} = defaultViewProps) => {

  const { initialFontSize } = options;

  const plugins = [];

  const schema = createSchema(schemaEnhancers, customSchema);

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
      yUndoPlugin({ trackedOrigins: [({}).constructor] })
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

  if (customSchema === 'text-only') {
    keysToMap['Enter'] = (state, dispatch) => {
      const {
        $from: { pos: from },
        $to: { pos: to }
      } = state.selection;

      dispatch(
        state.tr
          .replaceWith(from, to, state.schema.node('hard_break'))
          .scrollIntoView()
      );

      return true;
    };

    const historyPlugin = history();

    plugins.push(historyPlugin);

    keysToMap['Mod-z'] = undo;
    keysToMap['Mod-y'] = redo;
    keysToMap['Mod-Shift-z'] = redo;
  } else {
    plugins.push(...exampleSetup({
      menuBar: false,
      schema
    }));
  }

  // Put this at the end
  plugins.push(keymap(keysToMap));
  plugins.push(historyListenerPlugin());

  // TODO: Fix incompatible undo/redo operations when sync is enabled
  // plugins.push(historyListenerPlugin({ yjsHistory: Boolean(sync) }));

  let doc;
  if (htmlContent) {
    const html = document.createElement('div');
    html.innerHTML = htmlContent;
    doc = DOMParser.fromSchema(schema).parse(html);
  }

  const state = EditorState.create({
    doc,
    schema,
    plugins
  });

  const view = new EditorView(
    { mount: element },
    {
      state,
      nodeViews,
      handleKeyDown(view, event) {
        if (onKeyDown) {
          return onKeyDown(event);
        }
      },
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

        if (onContentChange && transaction.docChanged) {
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
