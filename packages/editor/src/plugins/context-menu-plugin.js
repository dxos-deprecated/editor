//
// Copyright 2020 Wireline, Inc.
//

import { PluginKey, Plugin } from 'prosemirror-state';

import { KEY_SPACE, isKeyEventCombination } from '../lib/keys';

const MENU_TRIGGER_EVENT_KEYS = [{ code: KEY_SPACE, ctrlKey: true }];

const contextMenuState = {
  open: false,
  position: { top: 0, left: 0 }
};

export const contextMenuPluginKey = new PluginKey('contextMenu');

export const contextMenuPluginDefaults = {
  triggerMenuEventKeys: MENU_TRIGGER_EVENT_KEYS
};

const contextMenuPlugin = ({ triggerMenuEventKeys = MENU_TRIGGER_EVENT_KEYS } = contextMenuPluginDefaults) => {
  const dispatchEvent = (event, view) => {
    const { to } = view.state.selection;

    let top, left;

    if (event.pageX) {
      top = event.layerY;
      left = event.pageX;
    } else {
      ({ top, left } = view.coordsAtPos(to));
      const dom = view.domAtPos(to);

      const node = dom.node.nodeType === window.document.TEXT_NODE ? dom.node.parentElement : dom.node;
      top = node.clientHeight + node.getBoundingClientRect().top;
    }

    view.dispatch(
      view.state.tr.setMeta(contextMenuPluginKey, {
        open: true,
        position: { top, left }
      })
    );
  };

  return new Plugin({
    key: contextMenuPluginKey,

    state: {
      init () {
        return contextMenuState;
      },
      apply (transaction, value) {
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
        contextmenu (view, event) {
          // Disable default context menu.
          event.preventDefault();
          return true;
        },
        mouseup (view, event) {
          // Right click
          if (event.button === 2) {
            event.preventDefault();
            dispatchEvent.apply(this, [event, view]);
            return true;
          }
          return false;
        }
      },
      handleKeyDown (view, event) {
        const { open } = this.getState(view.state);

        if (
          !open &&
          triggerMenuEventKeys.some(keyConfig => isKeyEventCombination(keyConfig, event))
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
