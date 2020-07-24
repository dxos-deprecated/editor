//
// Copyright 2020 DXOS.org
//

import React, { useCallback, forwardRef, useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import MuiMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';

export const MENU_EMPTY_OPTIONS_LABEL = 'None';
export const MENU_MAX_VISIBLE_ITEMS = 8; // To scroll.

const useStyles = makeStyles(theme => ({
  paper: ({ maxVisibleItems }) => ({
    maxHeight: maxVisibleItems * 32 + theme.spacing() // Last is top padding.
  }),

  unfocusedMenuPaper: ({ position: { top, left }, maxVisibleItems, orientation }) => ({
    width: 'fit-content',
    minWidth: 150,
    maxHeight: maxVisibleItems * 32 + theme.spacing(), // Last is top padding.
    overflow: 'auto',
    position: 'absolute',
    top,
    left,
    zIndex: 1,
    transform: `translateY(${orientation === 'up' ? 'calc(-100% - 20px)' : '20px'})`
  })
}));

const defaultMenuRenderItem = item => <ListItemText primary={(item || {}).label} />;

export const FocusedMenu = ({
  dom,
  emptyOptionsLabel = MENU_EMPTY_OPTIONS_LABEL,
  maxVisibleItems = MENU_MAX_VISIBLE_ITEMS,
  onClose,
  onContextMenu,
  onSelect,
  open,
  options = [],
  position = { top: 0, left: 0 },
  renderMenuItem = defaultMenuRenderItem
}) => {
  const classes = useStyles({ position, maxVisibleItems });
  const ref = useRef();

  return (
    <MuiMenu
      open={Boolean(open)}
      anchorEl={dom}
      anchorReference='anchorPosition'
      anchorPosition={position}
      onContextMenu={onContextMenu}
      onClose={onClose}
      autoFocus
      variant='menu'
      keepMounted
      classes={{ paper: classes.paper }}
    >
      <MenuItems
        options={options}
        emptyOptionsLabel={emptyOptionsLabel}
        renderMenuItem={renderMenuItem}
        onSelect={onSelect}
        ref={ref}
      />
    </MuiMenu>
  );
};

export const UnfocusedMenu = ({
  emptyOptionsLabel = MENU_EMPTY_OPTIONS_LABEL,
  maxVisibleItems = MENU_MAX_VISIBLE_ITEMS,
  onClose,
  onSelect,
  options,
  orientation = 'down',
  position = { top: 0, left: 0 },
  renderMenuItem = defaultMenuRenderItem,
  selectedIndex
}) => {
  const classes = useStyles({ position, maxVisibleItems, orientation });
  const ref = useRef();

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Paper className={classes.unfocusedMenuPaper} elevation={3}>
        <MenuList
          classes={undefined}
          onClose={onClose}
          variant='menu'
        >
          <MenuItems
            options={options}
            emptyOptionsLabel={emptyOptionsLabel}
            renderMenuItem={renderMenuItem}
            onSelect={onSelect}
            selectedIndex={selectedIndex}
            ref={ref}
          />
        </MenuList>
      </Paper>
    </ClickAwayListener>
  );
};

const MenuItems = forwardRef(({
  emptyOptionsLabel,
  onSelect,
  options,
  renderMenuItem,
  selectedIndex
}, ref) => {
  const handleClick = useCallback(option => event => {
    if (event.ctrlKey) {
      return event.preventDefault();
    }

    onSelect(option);
  }, [onSelect]);

  if (options.length === 0) {
    return (
      <MenuItem ref={ref} key='no-options' disabled>{emptyOptionsLabel}</MenuItem>
    );
  }

  let index = 0;
  let optionIndex = 0;

  const optionComponents = options.map(option => {
    let item;

    if (option.subheader) {
      const subheader = <MenuItem key={`subheader-${index}`} disabled dense>{option.subheader}</MenuItem>;

      item = subheader;

      if (index !== 0) {
        index++;
        item = [<Divider key={`divider-${index}`} />, subheader];
      }
    } else {
      const selected = selectedIndex !== undefined ? optionIndex === selectedIndex : selectedIndex;

      item = (
        <MenuItem
          key={optionIndex}
          dense
          onClick={handleClick(option)}
          selected={selected}
        >
          {
            renderMenuItem(option)
          }
        </MenuItem>
      );
      optionIndex++;
    }

    index++;
    return item;
  }).flat();

  return optionComponents;
});
