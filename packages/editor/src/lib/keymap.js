//
// Copyright 2020 Wireline, Inc.
//

import { baseKeymap, chainCommands, splitBlockKeepMarks, newlineInCode, createParagraphNear, liftEmptyBlock } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { wrapInList } from 'prosemirror-schema-list';
import { buildKeymap } from 'prosemirror-example-setup';

import { isEmptyListItem, getListType } from './prosemirror-helpers';

const textBreakCmd = (state, dispatch) => {
  const {
    $from: { pos: from },
    $to: { pos: to }
  } = state.selection;

  dispatch(
    state.tr
      .replaceWith(from, to, state.schema.text('\n'))
      .scrollIntoView()
  );

  return true;
};

// Maintain previous mark state. If user hits enter, will keep marks like Bold, Italic, etc
const hardBreakCmd = chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlockKeepMarks);

export const buildKeysPlugins = (schema, plugins, { initialFontSize, useTextBreak = true }) => {
  plugins.push(
    keymap({
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
    }),

    // Example setup keymaps
    keymap(buildKeymap(schema)),

    keymap({
      Enter: useTextBreak ? textBreakCmd : hardBreakCmd
    }),

    // Base device keymap
    keymap(baseKeymap)
  );
};
