//
// Copyright 2020 DXOS.org
//

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { DOMParser } from 'prosemirror-model';
import { history } from 'prosemirror-history';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { buildInputRules } from 'prosemirror-example-setup';

import { uuidv4 } from 'lib0/random';

import { createSyncPlugins } from './sync';
import { buildKeysPlugins } from './keymap';

import createSchema from './schema';

import contextMenuPlugin from '../plugins/context-menu-plugin';
import historyListenerPlugin from '../plugins/history-listener-plugin';
import suggestionsPlugin from '../plugins/suggestions-plugin';
import { buildProsemirrorNodeViews } from './prosemirror-nodeviews';
import { buildProsemirrorEvents } from './prosemirror-events';

export const createProsemirrorEditor = (element, options) => {
  const {
    contextMenu,
    initialContent,
    onTransaction,
    plugins: userPlugins = [],
    schema: schemaName,
    suggestions,
    sync
  } = options;

  const editor = {
    createReactElement (props) {
      const { tr, selection, schema } = editor.view.state;

      selection.replaceWith(tr, schema.node('react_element', { props }));

      view.dispatch(tr);
    }
  };

  // Build schema and get schema initial PM Doc content (empty doc).
  const { schema, initialDoc } = createSchema(schemaName, options);

  let doc = initialDoc;

  const plugins = [...userPlugins];

  // Context Menu & Suggestions Plugins have key binfings that
  // Should be registered first in order to work properly
  if (contextMenu) {
    plugins.push(contextMenuPlugin(contextMenu));
  }

  if (suggestions) {
    plugins.push(suggestionsPlugin(suggestions));
  }

  buildKeysPlugins(schema, plugins, { useTextBreak: schemaName === 'text-only' });

  if (sync) {
    doc = undefined;
    editor.sync = createSyncPlugins(sync, plugins);
  }

  plugins.push(
    buildInputRules(schema),
    history(),
    historyListenerPlugin(),
    dropCursor(),
    gapCursor()
  );

  // Fix incompatible undo/redo operations when sync is enabled
  // plugins.push(historyListenerPlugin({ yjsHistory: Boolean(sync) }));

  const domParser = DOMParser.fromSchema(schema);

  if (schemaName === 'text-only') {
    // This preserves \n line breaks on text-only schema
    domParser._parse = domParser.parse.bind(domParser);
    domParser.parse = (dom, options) => {
      options.preserveWhitespace = 'full';
      return domParser._parse(dom, options);
    };
    domParser._parseSlice = domParser.parseSlice.bind(domParser);
    domParser.parseSlice = (dom, options) => {
      options.preserveWhitespace = 'full';
      return domParser._parseSlice(dom, options);
    };
  }

  if (initialContent) {
    const html = window.document.createElement('div');
    html.innerHTML = initialContent;
    doc = domParser.parse(html);
  }

  const state = EditorState.create({
    doc,
    schema,
    plugins: plugins.flat(),
    domParser
  });

  const view = new EditorView(
    { mount: element },
    {
      state,

      // Prosemirror node view customizations
      nodeViews: buildProsemirrorNodeViews(options, schema),

      ...buildProsemirrorEvents(options, schema),

      dispatchTransaction (transaction) {
        const oldState = view.state;
        const newState = oldState.apply(transaction);

        try {
          view.updateState(newState);
        } catch (err) {
          if (!view.docView) {
            // View is unmounted
            return;
          }

          throw err;
        }

        onTransaction({ id: uuidv4(), oldState, newState, transaction });
      }
    }
  );

  view.id = uuidv4();

  editor.view = view;

  return editor;
};
