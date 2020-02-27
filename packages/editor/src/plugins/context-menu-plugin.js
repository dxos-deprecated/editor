//
// Copyright 2019 Wireline, Inc.
//

import { PluginKey, Plugin } from 'prosemirror-state';

const KEY_SPACE = 'Space';

const MENU_TRIGGER_EVENT_KEYS = ['@', '#'];

const contextMenuState = {
  open: false,
  position: { top: 0, left: 0 }
};

export const contextMenuPluginKey = new PluginKey('contextMenu');

export const contextMenuPluginDefaults = {
  triggerMenuEventKeys: MENU_TRIGGER_EVENT_KEYS
};

const contextMenuPlugin = ({ triggerMenuEventKeys = MENU_TRIGGER_EVENT_KEYS } = contextMenuPluginDefaults) => {
  // NOTE: Must be function since this context is used.
  function dispatchEvent(event, view) {
    const { to } = view.state.selection;

    let top;
    let left;
    if (event.pageX) {
      top = event.layerY;
      left = event.pageX;
    } else {
      const coords = view.coordsAtPos(to);
      const dom = view.domAtPos(to);
      top = dom.node.clientHeight + dom.node.getBoundingClientRect().top;
      ({ left } = coords);
    }

    view.dispatch(
      view.state.tr.setMeta(contextMenuPluginKey, {
        open: true,
        position: { top, left }
      })
    );
  }

  return new Plugin({
    key: contextMenuPluginKey,

    state: {
      init() {
        return contextMenuState;
      },
      apply(transaction, value) {
        const meta = transaction.getMeta(this);
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
        contextmenu(view, event) {
          // Disable default context menu.
          event.preventDefault();
          return true;
        },
        mouseup(view, event) {
          // Right click
          if (event.button === 2) {
            event.preventDefault();
            dispatchEvent.apply(this, [event, view]);
            return true;
          }
          return false;
        }
      },
      handleKeyDown(view, event) {
        const { open } = this.getState(view.state);

        if (
          !open &&
          (triggerMenuEventKeys.includes(event.key) ||
            (event.code === KEY_SPACE && event.ctrlKey))
        ) {
          event.preventDefault();
          dispatchEvent.apply(this, [event, view]);
          return true;
        }

        return false;
      }
    }
  });
};

export default contextMenuPlugin;
