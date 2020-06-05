//
// Copyright 2020 Wireline, Inc.
//

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { DOMSerializer, DOMParser } from 'prosemirror-model';
import { history, undo, redo } from 'prosemirror-history';
import { exampleSetup } from 'prosemirror-example-setup';

import { uuidv4 } from 'lib0/random';

import { createSchema } from './schema';
import { createSyncPlugins } from './sync';
import { buildKeysToMap } from './keymap';

import contextMenuPlugin from '../plugins/context-menu-plugin';
import historyListenerPlugin from '../plugins/history-listener-plugin';
import suggestionsPlugin from '../plugins/suggestions-plugin';

export const defaultEditorProps = {
  schema: 'basic',
  htmlContent: undefined,
  contextMenu: undefined,
  suggestions: undefined,
  sync: undefined,
  schemaEnhancers: [],
  options: {},
  onContentChange: undefined,
  onKeyDown: undefined,
  onRenderReactElement: undefined
};

export const createProsemirrorEditor = (element, {
  schema: customSchema,
  htmlContent,
  contextMenu,
  suggestions,
  sync,
  schemaEnhancers,
  options: { initialFontSize },
  onContentChange,
  onKeyDown,
  onReactElementDomCreated
} = defaultEditorProps) => {

  const editor = {
    createReactElement(props) {
      const { tr, selection, schema } = editor.view.state;

      selection.replaceWith(tr, schema.node('react_element', { props }));

      view.dispatch(tr);
    }
  };

  const plugins = [];

  const schema = createSchema(schemaEnhancers, customSchema);

  const serializer = DOMSerializer.fromSchema(schema);

  const keysToMap = buildKeysToMap(schema, initialFontSize);

  if (sync) {
    editor.sync = createSyncPlugins(sync, plugins, keysToMap);
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

  // Fix incompatible undo/redo operations when sync is enabled
  // plugins.push(historyListenerPlugin({ yjsHistory: Boolean(sync) }));

  let doc;
  if (htmlContent) {
    const html = window.document.createElement('div');
    html.innerHTML = htmlContent;
    doc = DOMParser.fromSchema(schema).parse(html);
  }

  const state = EditorState.create({
    doc,
    schema,
    plugins: plugins.flat()
  });

  const view = new EditorView(
    { mount: element },
    {
      state,
      nodeViews: {
        react_element(node) {
          const { attrs: { props = {} } } = node;

          const dom = window.document.createElement('reactelement');

          dom.setAttribute('props', encodeURI(JSON.stringify(props)));

          onReactElementDomCreated(dom, props);

          return {
            dom
          };
        }
      },
      onKeyDown: onKeyDown ? (view, event) => onKeyDown(event) : undefined,
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
