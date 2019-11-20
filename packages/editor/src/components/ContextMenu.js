//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import { withStyles, Divider } from '@material-ui/core';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

const MENU_INSERT_HEADER = 'Insert Item';
const MENU_CREATE_HEADER = 'New Item';

const MENU_NO_ITEMS_LABEL = 'None';
const MENU_MAX_ITEMS = 8; // To scroll.
const MENU_OFFSET_X = 10; // Points from mouse x click.
const MENU_OFFSET_Y = 10; // Points from mouse y click.

const contextMenuStyles = () => ({
  list: {
    position: 'absolute',
    // 8px padding top and bottom + 18px relative to listItemText font-size
    // MENU_LIST_MAX_ITEMS + 1 to discount header
    maxHeight: `calc(${MENU_MAX_ITEMS + 1} * 26px)`,
    overflow: 'auto',
    minWidth: 200
  },

  listItemText: {},

  listSubheader: {
    fontSize: 14,
    lineHeight: '18px',
    padding: 4,
    color: '#000'
  },

  listItem: {
    padding: 4
  }
});

/**
 * The context menu let's users create links and/or embed other pads.
 */
class ContextMenu extends Component {
  handleClick = option => () => {
    const { onSelect, onClose } = this.props;

    onSelect(option);
    onClose();
  };

  renderItemOption = (option, index) => {
    const { selectedIndex = null, renderItem, classes } = this.props;

    return (
      <ListItem
        key={option.id}
        button
        dense
        disableGutters
        selected={selectedIndex === index}
        onClick={this.handleClick(option)}
        className={classes.listItem}
      >
        {renderItem({ option })}
      </ListItem>
    );
  };

  render() {
    const { options = [], onClose, left, top, classes } = this.props;

    const optionsGroup1 = options.filter(({ create }) => !create);
    const optionsGroup2 = options.filter(({ create }) => create);

    let optionIndex = 0;

    return (
      <ClickAwayListener onClickAway={onClose}>
        <List
          component={Paper}
          dense
          disablePadding
          subheader={
            <ListSubheader
              component="div"
              disableGutters
              className={classes.listSubheader}
            >
              {MENU_INSERT_HEADER}
            </ListSubheader>
          }
          className={classes.list}
          style={{ left: left + MENU_OFFSET_X, top: top + MENU_OFFSET_Y }}
        >
          {options.length === 0 && (
            <ListItem
              key="no-items"
              disabled
              dense
              disableGutters
              className={classes.listItem}
            >
              <ListItemText
                primary={MENU_NO_ITEMS_LABEL}
                className={classes.listItemText}
              />
            </ListItem>
          )}
          {optionsGroup1.map(option =>
            this.renderItemOption(option, optionIndex++)
          )}

          {optionsGroup2.length > 0 && optionsGroup1.length > 0 && (
            <Divider key="divider" />
          )}
          {optionsGroup2.length > 0 && (
            <ListItem
              key="subheader"
              disabled
              disableGutters
              component="div"
              className={classes.listSubheader}
            >
              <ListItemText primary={MENU_CREATE_HEADER} />
            </ListItem>
          )}
          {optionsGroup2.map((option, index) =>
            this.renderItemOption(option, optionIndex + index)
          )}
        </List>
      </ClickAwayListener>
    );
  }
}

export default withStyles(contextMenuStyles)(ContextMenu);
