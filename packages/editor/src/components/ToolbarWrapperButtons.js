//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';

import { wrapInList } from 'prosemirror-schema-list';
import { lift } from 'prosemirror-commands';

import FormatIndentDecreaseIcon from '@material-ui/icons/FormatIndentDecrease';
import ListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import ListNumberedIcon from '@material-ui/icons/FormatListNumbered';

import { schema } from '../lib/schema';
import { blockActive } from '../lib/prosemirror-helpers';

import ToolbarButton from './ToolbarButton';

const WRAPPER_BUTTONS = {
  ordered_list: {
    title: 'Toggle ordered list',
    icon: ListNumberedIcon,
    fn: wrapInList(schema.nodes.ordered_list),
    isEnabled: wrapInList(schema.nodes.ordered_list),
    isActive: blockActive(schema.nodes.ordered_list),
  },
  bullet_list: {
    title: 'Toggle bullet list',
    icon: ListBulletedIcon,
    fn: wrapInList(schema.nodes.bullet_list),
    isEnabled: wrapInList(schema.nodes.bullet_list),
    isActive: blockActive(schema.nodes.bullet_list),
  },
  lift: {
    title: 'Lift out of enclosing block',
    icon: FormatIndentDecreaseIcon,
    fn: lift,
    isEnabled: lift
  }
};

const ToolbarWrapperButtons = ({ view }) => {
  const { state, dispatch } = view;

  return Object.values(WRAPPER_BUTTONS).map(({ title, icon, fn, isEnabled, isActive }) => {
    const disabled = isEnabled && !isEnabled(state);
    const active = isActive && isActive(state);

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
        active={active}
        disabled={disabled}
      />
    );
  });
};

export default ToolbarWrapperButtons;