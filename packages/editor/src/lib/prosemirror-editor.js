//
// Copyright 2020 DXOS.org
//

import { EditorView } from 'prosemirror-view';
import { EditorState, TextSelection } from 'prosemirror-state';
import { DOMParser } from 'prosemirror-model';
import { history } from 'prosemirror-history';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { buildInputRules } from 'prosemirror-example-setup';
import { toggleMark } from 'prosemirror-commands';

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

  // Editor api bridge
  const editor = {
    _createReactElement (type = 'block') {
      return function _doCreateReactElement (props, { className } = {}) {
        const { tr, selection, schema } = editor.view.state;

        selection.replaceWith(tr, schema.node(`${type}_react_element`, { props, className }));

        view.dispatch(tr);
      };
    },

    _runInTransaction (fn, tr) {
      let dispatch = true;
      if (tr) {
        dispatch = false;
      } else {
        tr = editor.view.state.tr;
      }

      fn(tr);

      if (dispatch) {
        editor.view.dispatch(tr);
      }
    },

    getContentHtml () {
      return editor.view.dom.innerHTML;
    },

    createTextSelection (from, to) {
      const { doc } = editor.view.state;
      return TextSelection.create(doc, from, to);
    },

    insertText (text, tr) {
      editor._runInTransaction(tr => {
        const { selection } = tr;
        text = text.replace(/\s/g, '\u00a0');
        tr = tr.insertText(text, selection.from, selection.to);
      }, tr);
    },

    insertLink (text, title, href, tr) {
      const { schema } = editor.view.state;

      if (!schema.marks.link) return;

      editor._runInTransaction(tr => {
        const { selection: { from, to } } = tr;

        text = text.replace(/\s/g, '\u00a0');

        tr = tr.insertText(text, from, to);
        tr = tr.addMark(from, tr.selection.to, schema.mark(schema.marks.link, { title, href }));
      }, tr);
    },

    scrollIntoView (tr) {
      editor._runInTransaction(tr => tr.scrollIntoView(), tr);
    },

    clear (focus = true) {
      const { view } = editor;
      const { state: { doc, tr } } = view;

      const allTextSelection = editor.createTextSelection(0, doc.content.size);
      allTextSelection.replaceWith(tr, initialDoc);
      view.dispatch(tr);

      focus && view.focus();
    },

    toggleMark
  };

  editor.createInlineReactElement = editor._createReactElement('inline');
  editor.createBlockReactElement = editor._createReactElement('block');
  editor.createReactElement = editor.createBlockReactElement;

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
