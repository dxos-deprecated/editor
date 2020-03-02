//
// Copyright 2020 Wireline, Inc.
//

import { PluginKey, Plugin } from 'prosemirror-state';
import { inputRules, InputRule } from 'prosemirror-inputrules';

import {
  KEY_ARROW_DOWN,
  KEY_ARROW_UP,
  KEY_BACKSPACE,
  KEY_ENTER,
  KEY_ESCAPE,
  KEY_SPACE,
  KEY_TAB
} from '../lib/keys';

const TRIGGER_EVENT_KEYS = ['@', '#'];

const SPECIAL_KEYS = [
  KEY_ARROW_DOWN,
  KEY_ARROW_UP,
  KEY_ENTER,
  KEY_ESCAPE,
  KEY_SPACE,
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
    "\ufffc"
  );

  const match = triggerRegExp.exec(textBefore) || ['', ''];
  inputRuleHandler(state, match, from - (match[0].length), to);
};

const suggestionsPluginState = {
  open: false,
  query: null,
  position: { top: 0, left: 0 },
  keyPressed: null
};

const suggestionsPlugin = ({
  triggerEventKeys = TRIGGER_EVENT_KEYS
} = suggestionsPluginDefaults) => {
  let pluginView;

  const triggerRegExp = new RegExp(`[${triggerEventKeys}]([\\w-_+=]*)$`);

  const inputRuleHandler = (state, match, start, end) => {

    const pluginState = suggestionsPluginKey.getState(state);

    const meta = {
      ...pluginState,
      start,
      end: end + 1,
      query: triggerEventKeys.includes(match[0]) ? null : match[1]
    };

    if (!meta.open) {
      let { top, left } = pluginView.coordsAtPos(start);
      const dom = pluginView.domAtPos(start);

      const node = dom.node.nodeType === document.TEXT_NODE ? dom.node.parentElement : dom.node;
      top = node.clientHeight + node.getBoundingClientRect().top;

      meta.open = true;
      meta.position = {
        top,
        left
      };
    } else if (match[0].length === 0 && match[1].length === 0) {
      meta.open = false;
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
        init() {
          return suggestionsPluginState;
        },
        apply(transaction, value) {
          const meta = transaction.getMeta(suggestionsPluginKey);
          if (!meta) {
            return value;
          }

          return {
            ...value,
            ...meta
          };
        }
      },

      props: {
        handleDOMEvents: {
          keyup(view, event) {
            const { open } = this.getState(view.state);
            const isBackspace = event.code === KEY_BACKSPACE;

            if (!open || !isBackspace) return false;

            const { $cursor } = view.state.selection;
            handleBackSpace(view, $cursor.pos, $cursor.pos, triggerRegExp, inputRuleHandler);

            return false;
          }
        },

        handleKeyDown(view, event) {
          const { open } = this.getState(view.state);
          const isAction = SPECIAL_KEYS.includes(event.code);
          const isSpace = event.code === KEY_SPACE;

          if (open && isAction) {
            view.dispatch(view.state.tr.setMeta(suggestionsPluginKey, { keyPressed: event.code }));
            return !isSpace;
          }

          return false;
        }
      },

      view(view) {
        pluginView = view;

        return {
          update() { },
          destroy() { }
        };
      }
    })
  ];
};

export default suggestionsPlugin;
