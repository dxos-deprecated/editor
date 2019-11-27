//
// Copyright 2019 Wireline, Inc.
//

import React, { PureComponent } from "react";

import MUIDivider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

import ToolbarButton from "./ToolbarButton";

class ToolbarNodeTypesButton extends PureComponent {

  state = {
    nodeTypesMenuAnchorElement: undefined
  }

  handleNodeTypesButtonClick = event => {
    this.setState({ nodeTypesMenuAnchorElement: event.currentTarget });
  };

  handleNodeTypesMenuClose = () => {
    this.setState({ nodeTypesMenuAnchorElement: undefined });
  };

  handleMenuItemSelected = (name, attrs) => event => {
    const { onMenuItemSelected } = this.props;
    event.preventDefault();
    this.handleNodeTypesMenuClose();
    onMenuItemSelected(name, attrs);
  }

  render() {
    const { nodeTypesMenuAnchorElement } = this.state;

    return (
      <div>
        <ToolbarButton
          title="Set block type"
          aria-controls="node-types-menu"
          aria-haspopup="true"
          color="default"
          onClick={this.handleNodeTypesButtonClick}
        >
          Type
        </ToolbarButton>
        <Menu
          id="node-types-menu"
          anchorEl={nodeTypesMenuAnchorElement}
          keepMounted
          open={Boolean(nodeTypesMenuAnchorElement)}
          onClose={this.handleNodeTypesMenuClose}
        >
          <MenuItem onClick={this.handleMenuItemSelected('paragraph')}>
            Paragraph
          </MenuItem>
          <MUIDivider />
          {[...Array(6).keys()].map(key => (
            <MenuItem
              key={key}
              onClick={this.handleMenuItemSelected('heading', {
                level: key + 1
              })}
            >
              <Typography style={{ fontSize: `1.${6 - key}rem` }}>
                Heading {key + 1}
              </Typography>
            </MenuItem>
          ))}
          <MUIDivider />
          <MenuItem
            style={{ fontFamily: 'monospace' }}
            onClick={this.handleMenuItemSelected('code_block')}
          >
            Code
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

export default ToolbarNodeTypesButton;