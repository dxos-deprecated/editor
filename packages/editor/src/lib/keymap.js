//
// Copyright 2020 Wireline, Inc.
//

import { baseKeymap } from 'prosemirror-commands';

export const buildKeysToMap = (schema, initialFontSize) => {
  const keysToMap = {
    ...baseKeymap,
    'Mod-=': (state, dispatch, view) => {
      const current = parseInt(
        parseFloat(view.dom.style.fontSize || initialFontSize),
        10
      );

      view.dom.style.fontSize = `${current + 1}px`;
      return true;
    },

    'Mod--': (state, dispatch, view) => {
      const current = parseInt(
        parseFloat(view.dom.style.fontSize || initialFontSize),
        10
      );

      view.dom.style.fontSize = `${current - 1}px`;
      return true;
    },

    Tab: (state, dispatch) => {
      const {
        $from: { pos: from },
        $to: { pos: to }
      } = state.selection;

      dispatch(
        state.tr
          .delete(from, to)
          .insert(from, schema.text('  '))
          .scrollIntoView()
      );

      return true;
    }
  };

  return keysToMap;
};
