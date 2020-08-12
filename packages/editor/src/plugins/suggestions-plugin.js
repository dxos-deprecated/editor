//
// Copyright 2020 DXOS.org
//

import { PluginKey, Plugin } from 'prosemirror-state';

import { KEY_SPACE, isKeyEventCombination } from '../lib/keys';

const TRIGGER_EVENT_KEYS = ['@', '#'];
const COMBINED_TRIGGER_EVENT_KEYS = [{ code: KEY_SPACE, ctrlKey: true }];

const suggestionsPluginDefaults = {
  triggerEventKeys: TRIGGER_EVENT_KEYS,
  combinedTriggerEventKeys: COMBINED_TRIGGER_EVENT_KEYS
};

export const suggestionsPluginKey = new PluginKey('suggestions');

const suggestionsPluginState = {
  open: false
};

const suggestionsPlugin = ({
  triggerEventKeys = TRIGGER_EVENT_KEYS,
  combinedTriggerEventKeys = COMBINED_TRIGGER_EVENT_KEYS
} = suggestionsPluginDefaults) => {
  return [
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
            value.open = meta.open;
            value.anchorEl = meta.anchorEl;
            value.triggerKey = meta.triggerKey;
          }

          return value;
        }
      },

      props: {
        handleDOMEvents: {
          keydown (view, event) {
            const { open } = suggestionsPluginKey.getState(view.state);

            const dispatchOpen = (open = true, data) => view.dispatch(view.state.tr.setMeta(suggestionsPluginKey, { do: 'open', open, ...data }));

            const doOpen = triggerEventKeys.includes(event.key) || combinedTriggerEventKeys.some(keyConfig => isKeyEventCombination(keyConfig, event));

            if (!open && doOpen) {
              event.preventDefault();

              let { top, left, bottom, right } = view.coordsAtPos(view.state.selection.to);
              top -= 10;
              bottom += 10;

              const getBoundingClientRect = () => ({
                top,
                bottom,
                left,
                right,
                height: top,
                width: right,
                x: left,
                y: left
              });

              const anchorEl = {
                clientWidth: getBoundingClientRect().width,
                clientHeight: getBoundingClientRect().height,
                getBoundingClientRect
              };

              setTimeout(() => dispatchOpen(true, { anchorEl, triggerKey: event.key }));

              return true;
            } else if (open) {
              return true;
            }

            return false;
          }
        }
      },

      view (view) {
        return {
          update () { },
          destroy () {
            view.dispatch(view.state.tr.setMeta(suggestionsPluginKey, { do: 'open', open: false }));
          }
        };
      }
    })
  ];
};

export default suggestionsPlugin;
