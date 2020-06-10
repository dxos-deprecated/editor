//
// Copyright 2020 Wireline, Inc.
//

import compose from 'lodash.flowright';
import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Divider from '@material-ui/core/Divider';
import MUIMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';

export const MENU_EMPTY_OPTIONS_LABEL = 'None';
export const MENU_MAX_VISIBLE_ITEMS = 8; // To scroll.

const focusedMenuStyles = theme => ({
  paper: ({ maxVisibleItems }) => ({
    maxHeight: maxVisibleItems * 32 + theme.spacing() // Last is top padding.
  })
});

const unfocusedMenuStyles = theme => ({
  root: ({ position: { top, left }, maxVisibleItems }) => ({
    width: 'fit-content',
    minWidth: 150,
    maxHeight: maxVisibleItems * 32 + theme.spacing(), // Last is top padding.
    position: 'absolute',
    top,
    left
  })
});

class FocusedMenuComponent extends Component {
  static defaultProps = {
    position: { top: 0, left: 0 },
    options: []
  }

  render () {
    const {
      classes,
      dom,
      emptyOptionsLabel,
      onClick,
      onClose,
      onContextMenu,
      options,
      position,
      renderMenuItem,
      renderMenuItems,
      open
    } = this.props;

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
        classes={classes}
      >
        {
          renderMenuItems({
            options,
            emptyOptionsLabel,
            renderMenuItem,
            onClick
          })
        }
      </MUIMenu>
    );
  }
}

class UnfocusedMenuComponent extends Component {
  render () {
    const {
      classes,
      emptyOptionsLabel,
      onClick,
      onClose,
      options,
      renderMenuItem,
      renderMenuItems,
      selectedIndex
    } = this.props;

    return (
      <Paper classes={classes}>
        <MenuList
          classes={undefined}
          onClose={onClose}
          variant='menu'
        >
          {
            renderMenuItems({
              options,
              emptyOptionsLabel,
              renderMenuItem,
              onClick,
              selectedIndex
            })
          }
        </MenuList>
      </Paper>
    );
  }
}

const withMenuHandlers = WrappedComponent => {
  const renderMenuItems = ({
    emptyOptionsLabel,
    onClick,
    options,
    renderMenuItem,
    selectedIndex
  }) => {
    if (options.length === 0) {
      return (
        <MenuItem key='no-options' disabled>{emptyOptionsLabel}</MenuItem>
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
            onClick={onClick(option)}
            selected={selectedIndex !== undefined ? optionIndex === selectedIndex : selectedIndex}
          >{renderMenuItem(option)}
          </MenuItem>
        );
      }

      optionIndex++;
      return item;
    }).flat();

    return optionComponents;
  };

  const handleClick = props => option => event => {
    const { onSelect, onClose } = props;

    if (event.ctrlKey) {
      return event.preventDefault();
    }

    onSelect(option);
    onClose();
  };

  const MenuHandlerWrapper = props => {
    return (
      <WrappedComponent
        {...props}
        onClick={handleClick(props)}
        renderMenuItems={renderMenuItems}
      />
    );
  };

  return MenuHandlerWrapper;
};

const commonDefaultProps = {
  renderMenuItem: item => (item || {}).label
};

export const UnfocusedMenu = compose(
  withMenuHandlers,
  withStyles(unfocusedMenuStyles)
)(UnfocusedMenuComponent);

export const FocusedMenu = compose(
  withMenuHandlers,
  withStyles(focusedMenuStyles)
)(FocusedMenuComponent);

FocusedMenu.defaultProps = commonDefaultProps;
UnfocusedMenu.defaultProps = commonDefaultProps;
