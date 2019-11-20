//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';
import ReactDOM from 'react-dom';
import { PluginKey, Plugin, TextSelection } from 'prosemirror-state';

const KEY_ARROW_UP = 'ArrowUp';
const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_TAB = 'Tab';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';
const KEY_SPACE = 'Space';

const SPECIAL_KEYS = [
  KEY_ARROW_UP,
  KEY_ARROW_DOWN,
  KEY_ENTER,
  KEY_ESCAPE,
  KEY_TAB
];

const TRIGGER_CHAR = '@';

const contextMenuState = {
  open: false,
  options: [],
  selection: undefined,
  selectedOptionIndex: 0,
  top: 0,
  right: 0
};

const contextMenuPluginKey = new PluginKey('contextMenu');

const contextMenuPlugin = ({
  MenuComponent = () => null,
  getOptions = () => [],
  onSelect = () => null,
  renderItem = () => null
}) => {

  // NOTE: Must be function since this context is used.
  function dispatchEvent(event, view) {
    const { from, to } = view.state.selection;

    const options = getOptions();
    if (event.key === TRIGGER_CHAR || event.metaKey) {
      options.forEach(option => {
        option.link = true;
      });
    }

    let top;
    let right;
    if (event.pageX) {
      top = event.layerY;
      right = event.pageX;
    } else {
      const coords = view.coordsAtPos(to);
      top = coords.top - 50;
      ({ right } = coords);
    }

    view.dispatch(view.state.tr
      .setMeta(this, {
        open: true,
        options,
        top,
        right,
        selection: { from, to }
      }));
  }

  const doSelect = async (view, option, { selection }) => {
    const to = await onSelect(option, { selection });

    view.dispatch(view.state.tr
      .setSelection(TextSelection.fromJSON(view.state.tr.doc, { type: 'text', anchor: to, head: to }))
      .scrollIntoView());

    view.focus();
  };

  return new Plugin({
    key: contextMenuPluginKey,

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
        const { open, selectedOptionIndex, options, selection } = this.getState(view.state);

        const setMeta = meta => view.dispatch(view.state.tr.setMeta(this, meta));

        if (open && SPECIAL_KEYS.includes(event.key)) {
          switch (event.key) {
            case KEY_ARROW_UP:
              // TODO(burdon): Scroll into view.
              if (selectedOptionIndex < 1) break;
              setMeta({ selectedOptionIndex: selectedOptionIndex - 1 });
              break;

            case KEY_ARROW_DOWN:
              // TODO(burdon): Scroll into view.
              if (selectedOptionIndex >= options.length - 1) break;
              setMeta({ selectedOptionIndex: selectedOptionIndex + 1 });
              break;

            case KEY_ESCAPE:
              setMeta(contextMenuState);
              break;

            case KEY_ENTER:
            case KEY_TAB:
              doSelect(view, options[selectedOptionIndex], { selection });
              setMeta(contextMenuState);
              break;

            default:
              break;
          }

          return true;
        }

        if (open && !SPECIAL_KEYS.includes(event.key)) {
          setMeta(contextMenuState);
          return false;
        }

        // Handle Ctrl+Space and @.
        // NOTE: Type @ twice to close the menu and insert the character'.
        // TODO(burdon): Ignore if previous character is not whitespace?
        if (!open && ((event.key === TRIGGER_CHAR) || (event.code === KEY_SPACE && event.ctrlKey))) {
          dispatchEvent.apply(this, [event, view]);
          return true;
        }

        return false;
      }
    },

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

    view: (view) => {
      const menuContainer = document.createElement('div');
      view.dom.parentNode.insertBefore(menuContainer, view.dom.nextSibling);

      return {
        update: (view, prevState) => {
          const pluginState = contextMenuPluginKey.getState(view.state);
          const prevPluginState = contextMenuPluginKey.getState(prevState);

          // Do nothing if our state doesn't change
          if (JSON.stringify(pluginState) === JSON.stringify(prevPluginState)) return;

          const { open, options, selectedOptionIndex, top, right, selection } = pluginState;

          if (open) {
            ReactDOM.render(
              <MenuComponent
                options={options}
                selectedIndex={selectedOptionIndex}
                onSelect={option => doSelect(view, option, { selection })}
                onClose={() => {
                  view.dispatch(view.state.tr.setMeta(contextMenuPluginKey, { open: false, selectedOptionIndex: 0 }));
                }}
                top={top}
                left={right}
                renderItem={renderItem}
              />,
              menuContainer
            );
          } else {
            ReactDOM.unmountComponentAtNode(menuContainer);
          }
        },
        destroy: () => {
          view.dom.parentNode.removeChild(menuContainer);
        }
      };
    }
  });
};

export default contextMenuPlugin;
