//
// Copyright 2020 DXOS.org
//

import { PluginKey, Plugin } from 'prosemirror-state';
import { inputRules, InputRule } from 'prosemirror-inputrules';

import {
  KEY_ARROW_DOWN,
  KEY_ARROW_UP,
  KEY_BACKSPACE,
  KEY_ENTER,
  KEY_ESCAPE,
  KEY_TAB,
  isCharKeyCode,
  isComposedKeyCode
} from '../lib/keys';

const TRIGGER_EVENT_KEYS = ['@', '#'];

const ACTION_KEYS = [
  KEY_ARROW_DOWN,
  KEY_ARROW_UP,
  KEY_ENTER,
  KEY_ESCAPE,
  KEY_TAB
];

export const suggestionsPluginDefaults = {
  triggerEventKeys: TRIGGER_EVENT_KEYS
};

export const suggestionsPluginKey = new PluginKey('suggestions');

const handleBackSpace = (view, from, to, triggerRegExp, inputRuleHandler) => {
  if (view.composing) return false;

  const state = view.state;
  const $from = state.doc.resolve(from);

  if ($from.parent.type.spec.code) return false;

  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - 500),
    $from.parentOffset,
    null,
    '\ufffc'
  );

  if (textBefore.length === 0) {
    view.dispatch(view.state.tr.setMeta(suggestionsPluginKey, { do: 'open', opened: false }));
    return false;
  }

  const match = triggerRegExp.exec(textBefore) || ['', '', ''];
  inputRuleHandler(state, match, from - (match[0].length), to);
};

const suggestionsPluginState = {
  opened: false,
  query: ''
};

const suggestionsPlugin = ({
  triggerEventKeys = TRIGGER_EVENT_KEYS
} = suggestionsPluginDefaults) => {
  let pluginView;

  const triggerRegExp = new RegExp(`([${triggerEventKeys.join('')}])([\\w-_+=]*)$`, 'i');

  const inputRuleHandler = (state, match, start, end) => {
    const { opened } = suggestionsPluginKey.getState(state);
    const { 2: query } = match;

    // console.log('S.inputRuleHandler', { opened, match, query, start, end });

    let meta = {
      start: start,
      end: end + 1,
      query
    };

    if (!opened) {
      let { top, left } = pluginView.coordsAtPos(start);
      const dom = pluginView.domAtPos(start);

      const node = dom.node.nodeType === window.document.TEXT_NODE ? dom.node.parentElement : dom.node;
      top = node.clientHeight + node.getBoundingClientRect().top;

      meta = {
        ...meta,
        do: 'open',
        opened: true,
        position: { top, left }
      };
    } else {
      meta.do = 'query';
    }

    pluginView.dispatch(state.tr.setMeta(suggestionsPluginKey, meta));

    return null;
  };

  return [
    inputRules({
      rules: [
        new InputRule(triggerRegExp, inputRuleHandler)
      ]
    }),

    new Plugin({
      key: suggestionsPluginKey,

      state: {
        init () {
          return suggestionsPluginState;
        },
        apply (transaction, value) {
          const meta = transaction.getMeta(suggestionsPluginKey);

          if (!meta) {
            return value;
          }

          if (meta.do === 'open') {
            value.opened = meta.opened;

            if (!meta.opened) {
              value.query = '';
            }
          }

          if (meta.do === 'query') {
            value.query = meta.query;
          }

          return value;
        }
      },

      props: {
        handleDOMEvents: {
          keydown (view, event) {
            const { opened, query } = suggestionsPluginKey.getState(view.state);
            const isAction = ACTION_KEYS.includes(event.code);
            const isComposed = isComposedKeyCode(event.keyCode);
            const isCharKey = isCharKeyCode(event.keyCode);
            const isBackspace = event.code === KEY_BACKSPACE;
            const isEscape = event.code === KEY_ESCAPE;
            const isTriggerKey = triggerEventKeys.includes(event.key);

            const shouldKeepOpen = isAction || isComposed || isCharKey || isBackspace;

            // console.log('S.handleDOMEvents.keydown', { opened, shouldKeepOpen, isAction, isComposed, isCharKey, query }, event);

            const dispatchClose = () => view.dispatch(view.state.tr.setMeta(suggestionsPluginKey, { do: 'open', opened: false }));

            if (isEscape) {
              dispatchClose();
            }

            if (!opened && query.length === 0 && isTriggerKey) {
              return true;
            }

            if (opened && shouldKeepOpen) {
              if (isBackspace) {
                return true;
              } else if (!isCharKey) {
                view.dispatch(view.state.tr.setMeta(suggestionsPluginKey, { do: 'keyPressed', code: event.code }));
                event.preventDefault();
              }

              return true;
            } else if (!shouldKeepOpen) {
              dispatchClose();
            }

            return false;
          },

          keyup (view, event) {
            const { opened } = this.getState(view.state);
            const isBackspace = event.code === KEY_BACKSPACE;

            if (!opened || !isBackspace) return false;

            const { $cursor } = view.state.selection;
            handleBackSpace(view, $cursor.pos, $cursor.pos, triggerRegExp, inputRuleHandler);

            return false;
          }
        }
      },

      view (view) {
        pluginView = view;

        return {
          update () { },
          destroy () { }
        };
      }
    })
  ];
};

export default suggestionsPlugin;
