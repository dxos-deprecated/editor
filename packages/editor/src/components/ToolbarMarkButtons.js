//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';

import CodeIcon from '@material-ui/icons/Code';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';

import { schema } from '../lib/schema';

import ToolbarButton from './ToolbarButton';

const MARK_BUTTONS = {
  strong: {
    name: 'strong',
    mark: schema.marks.strong,
    title: 'Toggle strong',
    icon: FormatBoldIcon,
    order: 1
  },
  em: {
    name: 'em',
    mark: schema.marks.em,
    title: 'Toggle emphasis',
    icon: FormatItalicIcon,
    order: 2
  },
  underline: {
    name: 'underline',
    mark: schema.marks.underline,
    title: 'Toggle underlined',
    icon: FormatUnderlinedIcon,
    order: 3
  },
  code: {
    name: 'code',
    mark: schema.marks.code,
    title: 'Toggle monospace font',
    icon: CodeIcon,
    order: 4
  }
};


const ToolbarMarkButtons = ({ activeMarks, onClick }) => {
  return Object.values(MARK_BUTTONS).map(({ name, title, icon, mark }) => (
    <ToolbarButton
      icon={icon}
      name={name}
      title={title}
      key={name}
      onClick={onClick(mark)}
      active={Boolean(activeMarks[name])}
    />
  ));
};

export default ToolbarMarkButtons;