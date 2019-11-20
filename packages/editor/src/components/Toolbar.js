import React, { Component } from 'react';
import classnames from 'classnames';

import { withStyles } from '@material-ui/core';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MUIToolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { grey, lightBlue } from '@material-ui/core/colors';

import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import CodeIcon from '@material-ui/icons/Code';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    backgroundColor: '#fff',
    borderBottom: `1px solid ${grey[500]}`,
    minHeight: 'fit-content'
  },
  button: {
    minWidth: 0,
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5)
  },
  buttonIcon: {
    margin: 0,
    color: grey[400]
  },
  buttonIconActive: {
    color: lightBlue[800]
  },
  buttonIconDisabled: {
    // color: theme.palette.primary.dark
  }
});

const HISTORY_BUTTONS = {
  undo: { name: 'undo', title: 'Undo last change', icon: UndoIcon, order: 1 },
  redo: { name: 'redo', title: 'Redo last change', icon: RedoIcon, order: 2 }
};

const MARK_BUTTONS = {
  strong: {
    name: 'strong',
    title: 'Toggle strong',
    icon: FormatBoldIcon,
    order: 1
  },
  em: {
    name: 'em',
    title: 'Toggle emphasis',
    icon: FormatItalicIcon,
    order: 2
  },
  underline: {
    name: 'underline',
    title: 'Toggle underlined',
    icon: FormatUnderlinedIcon,
    order: 3
  },
  code: {
    name: 'code',
    title: 'Toggle monospace font',
    icon: CodeIcon,
    order: 4
  }
};

// const NODE_TYPE_BUTTONS = {
//   paragraph: { name: 'paragraph', title: 'Set type paragraph', order: 1 },
//   heading: { name: 'heading', title: 'Set type heading', order: 2 },
//   code_block: { name: 'code_block', title: 'Set type code block', order: 3 }
// };

const ToolbarButton = withStyles(styles)(
  ({
    children,
    icon: IconComponent,
    name,
    title = name,
    active = false,
    disabled = false,
    onClick,
    classes
  }) => (
    <Tooltip title={title}>
      <Button
        classes={{
          root: classes.button,
          label: classes.buttonLabel,
          startIcon: classes.buttonIcon
        }}
        color="default"
        disabled={disabled}
        onClick={onClick}
        {...(IconComponent
          ? {
            startIcon: (
              <IconComponent
                className={classnames(
                  active && classes.buttonIconActive,
                  disabled && classes.buttonIconDisabled
                )}
              />
            )
          }
          : {})}
      >
        {children || ' '}
      </Button>
    </Tooltip>
  )
);

class Toolbar extends Component {
  state = {
    nodeTypesMenuAnchorElement: undefined
  };

  handleNodeTypesButtonClick = event => {
    this.setState({ nodeTypesMenuAnchorElement: event.currentTarget });
  };

  handleNodeTypesMenuClose = () => {
    this.setState({ nodeTypesMenuAnchorElement: undefined });
  };

  handleMarkButtonClick = name => event => {
    event.preventDefault();
    const { onMarkButtonClick } = this.props;
    onMarkButtonClick(name);
  };

  handleNodeTypeButtonClick = (name, attrs) => event => {
    event.preventDefault();
    const { onNodeTypeButtonClick } = this.props;
    onNodeTypeButtonClick(name, attrs);

    this.handleNodeTypesMenuClose();
  };

  handleHistoryButtonClick = type => event => {
    event.preventDefault();
    const { onHistoryButtonClick } = this.props;
    onHistoryButtonClick(type);
  };

  renderHistoryButtons = () => {
    const { canUndo, canRedo } = this.props;

    return Object.values(HISTORY_BUTTONS)
      .sort((a, b) => a.order - b.order)
      .map(spec => (
        <ToolbarButton
          {...spec}
          key={spec.name}
          onClick={this.handleHistoryButtonClick(spec.name)}
          active={
            (spec.name === 'undo' && canUndo) ||
            (spec.name === 'redo' && canRedo)
          }
        />
      ));
  };

  renderMarkButtons = () => {
    const { activeMarks } = this.props;

    return Object.values(MARK_BUTTONS).map(spec => (
      <ToolbarButton
        {...spec}
        key={spec.name}
        onClick={this.handleMarkButtonClick(spec.name)}
        active={Boolean(activeMarks[spec.name])}
      />
    ));

    // return Object.values(activeMarks)
    //   .filter(mark => Boolean(MARK_BUTTONS[mark.name]))
    //   .map(mark => ({ mark, spec: MARK_BUTTONS[mark.name] }))
    //   .sort((a, b) => a.spec.order - b.spec.order)
    //   .map(({ spec, mark }) => (
    //     <ToolbarButton
    //       {...spec}
    //       key={spec.name}
    //       onClick={this.handleMarkButtonClick(spec.name)}
    //       active={mark.active}
    //     />
    //   ));
  };

  renderNodeTypesMenu = () => {
    const { classes } = this.props;
    const { nodeTypesMenuAnchorElement } = this.state;

    return (
      <div>
        <Button
          aria-controls="node-types-menu"
          aria-haspopup="true"
          classes={{
            root: classes.button
          }}
          color="default"
          onClick={this.handleNodeTypesButtonClick}
        >
          Type
        </Button>
        <Menu
          id="node-types-menu"
          anchorEl={nodeTypesMenuAnchorElement}
          keepMounted
          open={Boolean(nodeTypesMenuAnchorElement)}
          onClose={this.handleNodeTypesMenuClose}
        >
          <MenuItem onClick={this.handleNodeTypeButtonClick('paragraph')}>
            Paragraph
          </MenuItem>
          <Divider />
          {[...Array(6).keys()].map(key => (
            <MenuItem
              key={key}
              onClick={this.handleNodeTypeButtonClick('heading', {
                level: key + 1
              })}
            >
              <Typography style={{ fontSize: `1.${6 - key}rem` }}>
                Heading {key + 1}
              </Typography>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem
            style={{ fontFamily: 'monospace' }}
            onClick={this.handleNodeTypeButtonClick('code_block')}
          >
            Code
          </MenuItem>
        </Menu>
      </div>
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <MUIToolbar disableGutters className={classes.root}>
        {this.renderHistoryButtons()}
        <Divider orientation="vertical" />
        {this.renderMarkButtons()}
        <Divider orientation="vertical" />
        {this.renderNodeTypesMenu()}
      </MUIToolbar>
    );
  }
}

export default withStyles(styles)(Toolbar);