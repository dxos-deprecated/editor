//
// Copyright 2020 Wireline, Inc.
//

import { baseKeymap } from 'prosemirror-commands';
import { wrapInList } from "prosemirror-schema-list";

import { isEmptyListItem, getListType } from './prosemirror-helpers';

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

      if (
        isEmptyListItem(state)
      ) {
        wrapInList(getListType(state))(state, dispatch);
        return true;
      }

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
