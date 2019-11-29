//
// Copyright 2019 Wireline, Inc.
//

import React, { PureComponent } from 'react';

import { setBlockType, toggleMark } from 'prosemirror-commands';
import { yUndoPluginKey, undo, redo } from 'y-prosemirror';

import { withStyles } from '@material-ui/core';

import MUIDivider from '@material-ui/core/Divider';
import MUIToolbar from '@material-ui/core/Toolbar';

import { grey } from '@material-ui/core/colors';

import { schema } from '../lib/schema';
import { getSelectedTextNodes, isLink, getActiveMarks } from '../lib/prosemirror-helpers';

import ToolbarLinkButton from './ToolbarLinkButton';
import ToolbarNodeTypesButton from './ToolbarNodeTypesButton';
import ToolbarHistoryButtons from './ToolbarHistoryButtons';
import ToolbarMarkButtons from './ToolbarMarkButtons';
import ToolbarWrapperButtons from './ToolbarWrapperButtons';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    backgroundColor: '#fff',
    borderBottom: `1px solid ${grey[500]}`,
    minHeight: 'fit-content'
  },
  divider: {
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5)
  }
});

class Toolbar extends PureComponent {
  state = {
    activeMarks: {},
    canUndo: false,
    canRedo: false,
    canSetLink: false,
    selectedLinkNodes: []
  };

  componentDidMount() {
    const { view } = this.props;

    let originalDispatch = view._props.dispatchTransaction;

    // Register to view changes
    view._props.dispatchTransaction = transaction => {

      const { oldState, newState } = originalDispatch(transaction);

      const sameSelection = newState.selection.eq(oldState.selection);

      if (transaction.meta.pointer || transaction.docChanged || !sameSelection) {
        this.handleViewUpdate(newState);
      }
    };

    // Register to history changes
    const { undoManager } = yUndoPluginKey.getState(view.state);
    undoManager.on('stack-item-popped', this.handleHistoryUpdate);
    undoManager.on('stack-item-added', this.handleHistoryUpdate);
  }

  handleViewUpdate = (newState) => {
    const { view } = this.props;

    const activeMarks = getActiveMarks(newState);
    const canSetLink = !newState.selection.empty && this.dispatchCommand(toggleMark(schema.marks.link), { dryRun: true });

    const selectedTextNodes = getSelectedTextNodes(view);
    const selectedLinkNodes = selectedTextNodes.filter(isLink);

    this.setState({ activeMarks, canSetLink, selectedLinkNodes });
  };

  handleHistoryUpdate = () => {
    const { view } = this.props;
    const { undoManager } = yUndoPluginKey.getState(view.state);

    const canUndo = undoManager.undoStack.length > 0;
    const canRedo = undoManager.redoStack.length > 0;

    this.setState({ canUndo, canRedo });
  }

  dispatchCommand = (fn, { dryRun = false, focus = true } = {}) => {
    const { view } = this.props;

    const dispatchResult = fn(view.state, !dryRun && view.dispatch);

    if (dryRun) return dispatchResult;

    focus && view.focus();
  };

  handleHistoryButtonClick = name => event => {
    const { view } = this.props;

    event.preventDefault();

    (name === 'undo' ? undo : redo)(view.state);
    view.focus();
  };

  handleMarkButtonClick = mark => event => {
    event.preventDefault();

    this.dispatchCommand(toggleMark(mark));
  };

  handleNodeTypeButtonClick = (name, attrs) => {
    this.dispatchCommand(setBlockType(schema.nodes[name], attrs));
  };

  handleWrapperButtonClick = command => event => {
    event.preventDefault();

    this.dispatchCommand(command);
  };

  handleSetLink = (title, linkUrl) => {
    const { view: { state: { doc, selection } } } = this.props;

    if (selection.empty) return false;

    const attrs = { title, href: linkUrl };

    if (doc.rangeHasMark(selection.from, selection.to, schema.marks.link)) {
      this.dispatchCommand(toggleMark(schema.marks.link, attrs));
    }

    return this.dispatchCommand(toggleMark(schema.marks.link, attrs));
  }

  handleRemoveLink = () => {
    const { view: { state: { selection } } } = this.props;

    if (selection.empty) return false;

    this.dispatchCommand(toggleMark(schema.marks.link));
  }

  render() {
    const { classes, view } = this.props;
    const { canUndo, canRedo, canSetLink, selectedLinkNodes, activeMarks } = this.state;

    return (
      <MUIToolbar disableGutters className={classes.root}>
        <ToolbarHistoryButtons canUndo={canUndo} canRedo={canRedo} onClick={this.handleHistoryButtonClick} />
        <ToolbarDivider />
        <ToolbarNodeTypesButton onMenuItemSelected={this.handleNodeTypeButtonClick} />
        <ToolbarDivider />
        <ToolbarMarkButtons activeMarks={activeMarks} onClick={this.handleMarkButtonClick} />
        <ToolbarDivider />
        <ToolbarWrapperButtons selection={view.state.selection} onClick={this.handleWrapperButtonClick} dispatchCommand={this.dispatchCommand} />
        <ToolbarDivider />
        <ToolbarLinkButton onSetLink={this.handleSetLink} onRemoveLink={this.handleRemoveLink} disabled={!canSetLink} selectedLinkNodes={selectedLinkNodes} />
      </MUIToolbar>
    );
  }
}

const ToolbarDivider = withStyles(styles)(({ classes }) => {
  return <MUIDivider orientation="vertical" className={classes.divider} />;
});

export default withStyles(styles)(Toolbar);
