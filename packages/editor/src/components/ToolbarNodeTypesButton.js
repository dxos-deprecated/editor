//
// Copyright 2019 Wireline, Inc.
//

import React, { PureComponent } from 'react';
import { setBlockType, wrapIn } from 'prosemirror-commands';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import MUIDivider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

import CodeIcon from '@material-ui/icons/Code';
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatQuoteIcon from '@material-ui/icons/FormatQuote';

import { blockActive } from '../lib/prosemirror-helpers';

import ToolbarButton from './ToolbarButton';

const buildHeadingButtons = schema =>
  [...Array(6).keys()].map((_, key) => ({
    icon: <Typography>H{key + 1}</Typography>,
    fn: setBlockType(schema.nodes.heading, { level: key + 1 }),
    isEnabled: setBlockType(schema.nodes.heading, { level: key + 1 }),
    isActive: blockActive(schema.nodes.heading, { level: key + 1 }),
    component: (
      <Typography style={{ fontSize: `1.${6 - key}rem` }}>
        Heading {key + 1}
      </Typography>
    )
  }));

const buildNodeTypeButtons = schema => {
  const headingButtons = buildHeadingButtons(schema);

  return [
    {
      title: 'Plain',
      icon: <FormatAlignLeftIcon />,
      fn: setBlockType(schema.nodes.paragraph),
      isEnabled: setBlockType(schema.nodes.paragraph),
      isActive: blockActive(schema.nodes.paragraph)
    },
    { separator: true },
    ...headingButtons,
    { separator: true },
    {
      title: 'Code block',
      icon: <CodeIcon />,
      fn: setBlockType(schema.nodes.code_block),
      isEnabled: setBlockType(schema.nodes.code_block),
      isActive: blockActive(schema.nodes.code_block)
    },
    { separator: true },
    {
      title: 'Block quote',
      icon: <FormatQuoteIcon />,
      fn: wrapIn(schema.nodes.blockquote),
      isEnabled: wrapIn(schema.nodes.blockquote),
      isActive: blockActive(schema.nodes.blockquote)
    }
  ];
};

class ToolbarNodeTypesButton extends PureComponent {
  state = {
    buttons: [],
    nodeTypesMenuAnchorElement: undefined
  };

  componentDidMount() {
    const {
      view: {
        state: { schema }
      }
    } = this.props;
    this.setState({ buttons: buildNodeTypeButtons(schema) });
  }

  handleNodeTypesButtonClick = event => {
    this.setState({ nodeTypesMenuAnchorElement: event.currentTarget });
  };

  handleNodeTypesMenuClose = () => {
    this.setState({ nodeTypesMenuAnchorElement: undefined });
  };

  handleMenuItemSelected = fn => event => {
    const { view } = this.props;
    const { state, dispatch } = view;

    event.preventDefault();
    fn(state, dispatch);
    view.focus();

    this.handleNodeTypesMenuClose();
  };

  render() {
    const {
      view: { state }
    } = this.props;
    const { nodeTypesMenuAnchorElement, buttons } = this.state;

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
          {buttons.map(
            (
              { separator, title, icon, fn, isEnabled, isActive, component },
              key
            ) => {
              if (separator) return <MUIDivider key={key} />;

              return (
                <MenuItem
                  key={key}
                  onClick={this.handleMenuItemSelected(fn)}
                  disabled={!isEnabled(state) || isActive(state)}
                  selected={isActive(state)}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  {title && <Typography variant="inherit">{title}</Typography>}
                  {component}
                </MenuItem>
              );
            }
          )}
        </Menu>
      </div>
    );
  }
}

export default ToolbarNodeTypesButton;
