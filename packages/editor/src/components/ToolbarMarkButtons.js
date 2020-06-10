//
// Copyright 2020 Wireline, Inc.
//

import React, { Component } from 'react';

import CodeIcon from '@material-ui/icons/Code';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';

import { markActive } from '../lib/prosemirror-helpers';

import ToolbarButton from './ToolbarButton';
import { toggleMark } from 'prosemirror-commands';

const buildMarkButtons = schema => [
  {
    title: 'Toggle strong',
    icon: FormatBoldIcon,
    isActive: markActive(schema.marks.strong),
    fn: toggleMark(schema.marks.strong)
  },
  {
    title: 'Toggle emphasis',
    icon: FormatItalicIcon,
    isActive: markActive(schema.marks.em),
    fn: toggleMark(schema.marks.em)
  },
  {
    title: 'Toggle underlined',
    icon: FormatUnderlinedIcon,
    isActive: markActive(schema.marks.underline),
    fn: toggleMark(schema.marks.underline)
  },
  {
    title: 'Toggle monospace font',
    icon: CodeIcon,
    isActive: markActive(schema.marks.code),
    fn: toggleMark(schema.marks.code)
  }
];

class ToolbarMarkButtons extends Component {
  state = {
    buttons: []
  };

  componentDidMount () {
    const {
      view: {
        state: { schema }
      }
    } = this.props;
    this.setState({ buttons: buildMarkButtons(schema) });
  }

  render () {
    const { view } = this.props;
    const { buttons } = this.state;
    const { state, dispatch } = view;

    return buttons.map(({ title, icon, isActive, fn }) => {
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
  }
}

export default ToolbarMarkButtons;
