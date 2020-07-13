//
// Copyright 2020 DXOS.org
//

import {
  baseKeymap, chainCommands, splitBlockKeepMarks, newlineInCode, createParagraphNear, liftEmptyBlock, toggleMark
} from 'prosemirror-commands';
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

const getCurrentFontSize = view => {
  const fontSizeStyle = window.getComputedStyle(view.dom, null).getPropertyValue('font-size');
  return parseInt(parseFloat(fontSizeStyle), 10);
};

export const buildKeysPlugins = (schema, plugins, { useTextBreak = true }) => {
  plugins.push(
    keymap({
      'Mod-=': (state, dispatch, view) => {
        const current = getCurrentFontSize(view);

        view.dom.style.fontSize = `${current + 1}px`;
        return true;
      },

      'Mod--': (state, dispatch, view) => {
        const current = getCurrentFontSize(view);

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

    })
  );

  if (schema.marks.underline) {
    plugins.push(keymap({
      'Mod-u': toggleMark(schema.marks.underline)
    }));
  }

  plugins.push(
    // Example setup keymaps
    keymap(buildKeymap(schema)),

    keymap({
      Enter: useTextBreak ? textBreakCmd : hardBreakCmd
    }),

    // Base device keymap
    keymap(baseKeymap)
  );
};
