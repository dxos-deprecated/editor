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

import ToolbarButton from './ToolbarButton';

const WRAPPER_BUTTONS = {
  ordered_list: {
    name: 'ordered_list',
    title: 'Toggle ordered list',
    icon: ListNumberedIcon,
    fn: wrapInList(schema.nodes.ordered_list),
    order: 1
  },
  bullet_list: {
    name: 'bullet_list',
    title: 'Toggle bullet list',
    icon: ListBulletedIcon,
    fn: wrapInList(schema.nodes.bullet_list),
    order: 2
  },
  lift: {
    name: 'decrease_indentation',
    title: 'Decrease indentation',
    icon: FormatIndentDecreaseIcon,
    fn: lift,
    order: 2
  }
};

const ToolbarWrapperButtons = ({ onClick, dispatchCommand }) => {

  return Object.values(WRAPPER_BUTTONS).map(({ name, title, icon, fn }) => {
    let disabled = false;

    disabled = !dispatchCommand(fn, { dryRun: true });

    return (
      <ToolbarButton
        icon={icon}
        name={name}
        title={title}
        key={name}
        onClick={onClick(fn)}
        disabled={disabled}
      />
    );
  });
};

export default ToolbarWrapperButtons;