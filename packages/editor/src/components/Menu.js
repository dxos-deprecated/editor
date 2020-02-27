//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Divider from '@material-ui/core/Divider';
import MUIMenu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

export const MENU_EMPTY_OPTIONS_LABEL = 'None';
export const MENU_MAX_VISIBLE_ITEMS = 8; // To scroll.

const styles = theme => ({
  menuPaper: ({ maxVisibleItems }) => ({
    maxHeight: maxVisibleItems * 32 + theme.spacing() // Last is top padding.
  })
});

class Menu extends Component {

  static defaultProps = {
    emptyOptionsLabel: MENU_EMPTY_OPTIONS_LABEL,
    maxVisibleItems: MENU_MAX_VISIBLE_ITEMS
  }

  handleClick = option => event => {
    const { onSelect, onClose } = this.props;

    if (event.ctrlKey) {
      return event.preventDefault();
    }

    onSelect(option);
    onClose();
  };

  renderItemOption = (option, index) => {
    const { renderMenuItem } = this.props;

    return (
      <MenuItem
        key={index}
        dense
        onClick={this.handleClick(option)}
      >{renderMenuItem(option)}</MenuItem>
    );
  };

  renderListSubheader = (title, key) => {
    return (
      <MenuItem key={key} disabled dense>{title}</MenuItem>
    );
  }

  renderMenuItems = () => {
    const { options, emptyOptionsLabel } = this.props;

    if (options.length === 0) {
      return (
        <MenuItem key="no-options" disabled>{emptyOptionsLabel}</MenuItem>
      );
    }

    let optionIndex = 0;

    return options.map(option => {
      let item;

      if (option.subheader) {
        const subheader = this.renderListSubheader(option.subheader, optionIndex);

        item = subheader;

        if (optionIndex !== 0) {
          optionIndex++;
          item = [<Divider key={optionIndex} />, subheader];
        }
      } else {
        item = this.renderItemOption(option, optionIndex);
      }

      optionIndex++;
      return item;
    });
  };

  render() {
    const { viewDom, position, onClose, onContextMenu, classes } = this.props;

    return (
      <MUIMenu
        open={Boolean(viewDom)}
        anchorEl={viewDom}
        anchorReference="anchorPosition"
        anchorPosition={position}
        onContextMenu={onContextMenu}
        onClose={onClose}
        variant="menu"
        keepMounted
        classes={{
          paper: classes.menuPaper
        }}
      >
        {this.renderMenuItems()}
      </MUIMenu>
    );
  }
}

export default withStyles(styles)(Menu);
