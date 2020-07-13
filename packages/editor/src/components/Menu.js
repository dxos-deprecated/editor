//
// Copyright 2020 DXOS.org
//

import React, { useCallback, forwardRef, useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Divider from '@material-ui/core/Divider';
import MUIMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';

export const MENU_EMPTY_OPTIONS_LABEL = 'None';
export const MENU_MAX_VISIBLE_ITEMS = 8; // To scroll.

const useStyles = makeStyles(theme => ({
  paper: ({ maxVisibleItems }) => ({
    maxHeight: maxVisibleItems * 32 + theme.spacing() // Last is top padding.
  }),

  unfocusedMenuPaper: ({ position: { top, left }, maxVisibleItems }) => ({
    width: 'fit-content',
    minWidth: 150,
    maxHeight: maxVisibleItems * 32 + theme.spacing(), // Last is top padding.
    position: 'absolute',
    top,
    left,
    zIndex: 1
  })
}));

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
  renderMenuItem = item => (item || {}).label
}) => {
  const classes = useStyles({ position, maxVisibleItems });
  const ref = useRef();

  return (
    <MUIMenu
      open={Boolean(open)}
      anchorEl={dom}
      anchorReference='anchorPosition'
      anchorPosition={position}
      onContextMenu={onContextMenu}
      onClose={onClose}
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
    </MUIMenu>
  );
};

export const UnfocusedMenu = ({
  emptyOptionsLabel = MENU_EMPTY_OPTIONS_LABEL,
  maxVisibleItems = MENU_MAX_VISIBLE_ITEMS,
  onClose,
  onSelect,
  options,
  position = { top: 0, left: 0 },
  renderMenuItem = item => (item || {}).label,
  selectedIndex
}) => {
  const classes = useStyles({ position, maxVisibleItems });
  const ref = useRef();

  return (
    <Paper className={classes.unfocusedMenuPaper}>
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

  let optionIndex = 0;

  const optionComponents = options.map(option => {
    let item;

    if (option.subheader) {
      const subheader = <MenuItem key={optionIndex} disabled dense>{option.subheader}</MenuItem>;

      item = subheader;

      if (optionIndex !== 0) {
        optionIndex++;
        item = [<Divider key={optionIndex} />, subheader];
      }
    } else {
      item = (
        <MenuItem
          key={optionIndex}
          dense
          onClick={handleClick(option)}
          selected={selectedIndex !== undefined ? optionIndex === selectedIndex : selectedIndex}
        >
          {
            renderMenuItem(option)
          }
        </MenuItem>
      );
    }

    optionIndex++;
    return item;
  }).flat();

  return optionComponents;
});
