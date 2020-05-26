//
// Copyright 2020 Wireline, Inc.
//

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { DOMSerializer, DOMParser } from 'prosemirror-model';
import { history, undo, redo } from 'prosemirror-history';
import { exampleSetup } from 'prosemirror-example-setup';

import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo as yUndo, redo as yRedo } from 'y-prosemirror';
import { WebrtcProvider } from 'y-webrtc';

import ColorHash from 'color-hash';

import contextMenuPlugin from '../plugins/context-menu-plugin';
import historyListenerPlugin from '../plugins/history-listener-plugin';
import suggestionsPlugin from '../plugins/suggestions-plugin';

import { createSchema } from './schema';

const colorHash = new ColorHash();

export const defaultViewProps = {
  schema: 'basic',
  htmlContent: undefined,
  contextMenu: undefined,
  suggestions: undefined,
  sync: undefined,
  nodeViews: {},
  schemaEnhancers: [],
  options: {},
  onContentChange: undefined,
  onKeyDown: undefined
};

export const createProsemirrorView = (element, {
  schema: customSchema,
  htmlContent,
  contextMenu,
  suggestions,
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
    const { status, document, id } = sync;

    // Content sync plugin
    const syncPlugin = ySyncPlugin(document.content.xmlFragment);

    const provider = new WebrtcProvider(status.channel, document.doc, status.providerOptions);

    const cursorBuilder = user => {
      const statusHTML = window.document.createElement('div');
      statusHTML.innerHTML = [
        '<span class="status">',
        `<span class="cursor" style="background-color: ${user.color};">&nbsp;</span>`,
        `<span class="username" style="background-color: ${user.color};">${user.name}</span>`,
        '</span>'
      ].join('');

      return statusHTML.firstElementChild;
    };

    // Set initial state
    provider.awareness.setLocalStateField('user', { color: colorHash.hex(id), name: status.getUsername() });

    provider.awareness.on('change', console.log);

    // Cursor indicator plugin
    const cursorPlugin = yCursorPlugin(provider.awareness, { cursorBuilder });

    // Yjs history plugin
    const undoPlugin = yUndoPlugin({ trackedOrigins: [({}).constructor] });

    plugins.push(
      syncPlugin,
      cursorPlugin,
      undoPlugin
    );

    keysToMap['Mod-z'] = yUndo;
    keysToMap['Mod-y'] = yRedo;
    keysToMap['Mod-Shift-z'] = yRedo;
  }

  if (contextMenu) {
    plugins.push(
      contextMenuPlugin({ triggerMenuEventKeys: contextMenu.triggerMenuEventKeys })
    );
  }

  if (suggestions) {
    plugins.push(suggestionsPlugin(suggestions));
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

  // Put this here
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
    plugins: plugins.flat()
  });

  const handleKeyDown = onKeyDown ? (_, event) => onKeyDown(event) : undefined;

  const view = new EditorView(
    { mount: element },
    {
      state,
      nodeViews,
      handleKeyDown,
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

        return { oldState, newState, transaction };
      }
    }
  );

  return view;
};
