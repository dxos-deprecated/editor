//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';

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
 * Context menu component.
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
        key={index}
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

  renderListSubheader = (title, key) => {
    const { classes } = this.props;

    return (
      <ListItem
        key={key}
        disabled
        disableGutters
        component="div"
        className={classes.listSubheader}
      >
        <ListItemText primary={title} />
      </ListItem>
    );
  }

  renderListItems = (optionIndexStart = 0) => {
    const { options, classes } = this.props;

    if (optionIndexStart > options.length) {
      return (
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
      );
    }

    return options.slice(optionIndexStart).map((option, index) => {
      const optionIndex = optionIndexStart + index;

      if (option.subheader) {
        const subheader = this.renderListSubheader(option.subheader, optionIndex);

        if (optionIndex !== 0) {
          return [<Divider key={optionIndex} />, subheader];
        }

        return subheader;
      } else {
        return this.renderItemOption(option, optionIndex);
      }
    }).flat();
  }

  render() {
    const { options = [], onClose, left, top, classes } = this.props;

    let optionIndexStart = 0;

    const firstSubheader = options.length > 0 && options[0].subheader && this.renderListSubheader(options[0].subheader);
    optionIndexStart += firstSubheader ? 1 : 0;

    return (
      <ClickAwayListener onClickAway={onClose}>
        <List
          component={Paper}
          dense
          disablePadding
          subheader={firstSubheader}
          className={classes.list}
          style={{ left: left + MENU_OFFSET_X, top: top + MENU_OFFSET_Y }}
        >
          {this.renderListItems(optionIndexStart)}
        </List>
      </ClickAwayListener>
    );
  }
}

export default withStyles(contextMenuStyles)(ContextMenu);
