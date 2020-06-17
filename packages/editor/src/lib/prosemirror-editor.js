//
// Copyright 2020 Wireline, Inc.
//

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { DOMSerializer, DOMParser } from 'prosemirror-model';
import { history } from 'prosemirror-history';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { buildInputRules } from 'prosemirror-example-setup';

import { uuidv4 } from 'lib0/random';

import { createSchema } from './schema';
import { createSyncPlugins } from './sync';
import { buildKeysPlugins } from './keymap';

import contextMenuPlugin from '../plugins/context-menu-plugin';
import historyListenerPlugin from '../plugins/history-listener-plugin';
import suggestionsPlugin from '../plugins/suggestions-plugin';
import { buildNodeViews } from './node-views';
import { buildProsemirrorEvents } from './prosemirror-events';

export const defaultEditorProps = {
  schema: 'basic',
  htmlContent: undefined,
  contextMenu: undefined,
  suggestions: undefined,
  sync: undefined,
  schemaEnhancers: [],
  options: {},
  onContentChange: undefined,
  onKeyDown: undefined
};

export const createProsemirrorEditor = (element, options = defaultEditorProps) => {
  const {
    schema: customSchema,
    htmlContent,
    contextMenu,
    suggestions,
    sync,
    schemaEnhancers,
    options: { initialFontSize },
    onContentChange
  } = options;

  const editor = {
    createReactElement (props) {
      const { tr, selection, schema } = editor.view.state;

      selection.replaceWith(tr, schema.node('react_element', { props }));

      view.dispatch(tr);
    }
  };

  const plugins = [];

  const schema = createSchema(schemaEnhancers, customSchema);

  const serializer = DOMSerializer.fromSchema(schema);

  buildKeysPlugins(schema, plugins, { initialFontSize, useTextBreak: customSchema === 'text-only' });

  if (sync) {
    editor.sync = createSyncPlugins(sync, plugins);
  }

  if (contextMenu) {
    plugins.push(
      contextMenuPlugin({ triggerMenuEventKeys: contextMenu.triggerMenuEventKeys })
    );
  }

  if (suggestions) {
    plugins.push(suggestionsPlugin(suggestions));
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

  if (customSchema === 'text-only') {
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

  let doc;
  if (htmlContent) {
    const html = window.document.createElement('div');
    html.innerHTML = htmlContent;
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
      nodeViews: buildNodeViews(options, schema),

      ...buildProsemirrorEvents(options, schema),

      dispatchTransaction (transaction) {
        const oldState = view.state;
        const newState = oldState.apply(transaction);

        try {
          view.updateState(newState);
        } catch (err) {
          console.error(err);
        }

        if (onContentChange && transaction.docChanged) {
          const contentContainer = window.document.createElement('div');
          serializer.serializeFragment(newState.doc.content, { document: window.document }, contentContainer);
          onContentChange(contentContainer.innerHTML);
        }

        return { oldState, newState, transaction };
      }
    }
  );

  view.id = uuidv4();

  editor.view = view;

  return editor;
};
