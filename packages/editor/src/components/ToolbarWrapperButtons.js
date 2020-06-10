//
// Copyright 2020 Wireline, Inc.
//

import React, { useCallback, useState } from 'react';

import ListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import ListNumberedIcon from '@material-ui/icons/FormatListNumbered';

import { toggleList, isListItemOfType, canToggleList } from '../lib/prosemirror-helpers';

import ToolbarButton from './ToolbarButton';

const buildWrapperButtons = schema => ({
  orderedList: {
    title: 'Toggle ordered list',
    icon: ListNumberedIcon,
    fn: toggleList(schema.nodes.ordered_list),
    enabled: canToggleList(schema.nodes.ordered_list),
    active: isListItemOfType(schema.nodes.ordered_list)
  },
  unorderedList: {
    title: 'Toggle bullet list',
    icon: ListBulletedIcon,
    fn: toggleList(schema.nodes.bullet_list),
    enabled: canToggleList(schema.nodes.bullet_list),
    active: isListItemOfType(schema.nodes.bullet_list)
  }
});

const ToolbarWrapperButtons = ({ view }) => {
  const [buttons] = useState(() => buildWrapperButtons(view.state.schema));

  const handleClick = useCallback(fn => event => {
    event.preventDefault();
    const { state, dispatch } = view;
    fn(state, dispatch);
    view.focus();
  }, []);

  window.view = view;

  return Object.entries(buttons).map(([name, { title, icon, enabled, active, fn }]) => {
    return (
      <ToolbarButton
        key={name}
        icon={icon}
        title={title}
        onClick={handleClick(fn)}
        active={active(view.state)}
        disabled={!enabled(view.state)}
      />
    );
  });
  // }
};

export default ToolbarWrapperButtons;
