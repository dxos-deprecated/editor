//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';

import CodeIcon from '@material-ui/icons/Code';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';

import { schema } from '../lib/schema';
import { markActive } from '../lib/prosemirror-helpers';

import ToolbarButton from './ToolbarButton';
import { toggleMark } from 'prosemirror-commands';

const MARK_BUTTONS = {
  strong: {
    title: 'Toggle strong',
    icon: FormatBoldIcon,
    isActive: markActive(schema.marks.strong),
    fn: toggleMark(schema.marks.strong)
  },
  em: {
    title: 'Toggle emphasis',
    icon: FormatItalicIcon,
    isActive: markActive(schema.marks.em),
    fn: toggleMark(schema.marks.em)
  },
  underline: {
    title: 'Toggle underlined',
    icon: FormatUnderlinedIcon,
    isActive: markActive(schema.marks.underline),
    fn: toggleMark(schema.marks.underline)
  },
  code: {
    title: 'Toggle monospace font',
    icon: CodeIcon,
    isActive: markActive(schema.marks.code),
    fn: toggleMark(schema.marks.code)
  }
};


const ToolbarMarkButtons = ({ view }) => {
  const { state, dispatch } = view;

  return Object.values(MARK_BUTTONS).map(({ title, icon, isActive, fn }) => {
    return (
      <ToolbarButton
        key={title}
        icon={icon}
        title={title}
        onClick={event => {
          event.preventDefault();
          fn(state, dispatch);
          view.focus();
        }}
        active={isActive(state)}
      />
    );
  });
};

export default ToolbarMarkButtons;