//
// Copyright 2019 Wireline, Inc.
//

import debounce from 'lodash.debounce';
import React, { PureComponent } from 'react';

import { setBlockType, toggleMark } from 'prosemirror-commands';

import { withStyles } from '@material-ui/core';
import MUIDivider from '@material-ui/core/Divider';
import MUIToolbar from '@material-ui/core/Toolbar';
import { grey } from '@material-ui/core/colors';

import { getSelectedTextNodes, isLink } from '../lib/prosemirror-helpers';

import ToolbarLinkButton from './ToolbarLinkButton';
import ToolbarNodeTypesButton from './ToolbarNodeTypesButton';
import ToolbarHistoryButtons from './ToolbarHistoryButtons';
import ToolbarMarkButtons from './ToolbarMarkButtons';
import ToolbarWrapperButtons from './ToolbarWrapperButtons';
import ToolbarImageButton from './ToolbarImageButton';
import { historyListenerPluginKey } from '../plugins/history-listener-plugin';

const styles = theme => ({
  root: {
    minHeight: 'fit-content',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    backgroundColor: grey[50],
    whiteSpace: 'nowrap'
  },

  divider: {
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5)
  }
});

class Toolbar extends PureComponent {
  state = {
    canUndo: false,
    canRedo: false,
    canSetLink: false,
    selectedLinkNodes: []
  };

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    const { view } = this.props;

    if (!view) return;

    const { history } = historyListenerPluginKey.getState(view.state);

    history.off('update', this.handleHistoryUpdate);

    view._props.dispatchTransaction = view._props.originalDispatch;
    this._mounted = false;
  }

  componentDidUpdate(prevProps) {
    const { view } = this.props;
    const { view: prevView = {} } = prevProps;

    if (view && view.id !== prevView.id) {
      let originalDispatch = view._props.dispatchTransaction;

      view._props.originalDispatch = originalDispatch;

      // Register to view changes.
      view._props.dispatchTransaction = transaction => {
        const { newState } = originalDispatch(transaction);
        this.handleViewUpdate(newState);
      };

      const { history } = historyListenerPluginKey.getState(view.state);

      if (history) {
        history.on('update', this.handleHistoryUpdate);
      }
    }
  }

  handleViewUpdate = debounce(newState => {
    if (!this._mounted) {
      return;
    }

    const { view } = this.props;

    const canSetLink = !newState.selection.empty &&
      this.dispatchCommand(toggleMark(view.state.schema.marks.link), { dryRun: true });

    const selectedTextNodes = getSelectedTextNodes(view.state);
    const selectedLinkNodes = selectedTextNodes.filter(isLink(view.state.schema));

    this.setState({ canSetLink, selectedLinkNodes });
  }, 250);

  handleHistoryUpdate = ({ canUndo, canRedo }) => {
    this.setState({ canUndo, canRedo });
  };

  dispatchCommand = (fn, { dryRun = false, focus = true } = {}) => {
    const { view } = this.props;

    const dispatchResult = fn(view.state, !dryRun && view.dispatch);
    if (dryRun) {
      return dispatchResult;
    }

    focus && view.focus();
  };

  handleHistoryButtonClick = name => event => {
    const { view } = this.props;
    const { history } = historyListenerPluginKey.getState(view.state);

    event.preventDefault();

    history[name](view.state, view.dispatch);
    view.focus();
  };

  // TODO(burdon): Not used.
  handleMarkButtonClick = mark => event => {
    event.preventDefault();

    this.dispatchCommand(toggleMark(mark));
  };

  // TODO(burdon): Not used.
  handleNodeTypeButtonClick = (name, attrs) => {
    const { view: { state: { schema } } } = this.props;

    this.dispatchCommand(setBlockType(schema.nodes[name], attrs));
  };

  // TODO(burdon): Not used.
  handleWrapperButtonClick = command => event => {
    event.preventDefault();

    this.dispatchCommand(command);
  };

  handleSetLink = (title, linkUrl) => {
    const { view: { state: { doc, selection, schema } } } = this.props;
    if (selection.empty) {
      return false;
    }

    const attrs = { title, href: linkUrl };

    if (doc.rangeHasMark(selection.from, selection.to, schema.marks.link)) {
      this.dispatchCommand(toggleMark(schema.marks.link, attrs));
    }

    return this.dispatchCommand(toggleMark(schema.marks.link, attrs));
  };

  handleRemoveLink = () => {
    const { view: { state: { schema, selection } } } = this.props;
    if (selection.empty) {
      return false;
    }

    this.dispatchCommand(toggleMark(schema.marks.link));
  };

  render() {
    const { classes, view } = this.props;
    const { canUndo, canRedo, canSetLink, selectedLinkNodes } = this.state;

    if (!view) {
      return null;
    }

    return (
      <MUIToolbar disableGutters className={classes.root}>
        <ToolbarHistoryButtons
          canUndo={canUndo}
          canRedo={canRedo}
          onClick={this.handleHistoryButtonClick}
        />
        <ToolbarDivider />
        <ToolbarNodeTypesButton view={view} />
        <ToolbarDivider />
        <ToolbarMarkButtons view={view} />
        <ToolbarDivider />
        <ToolbarWrapperButtons view={view} />
        <ToolbarDivider />
        <ToolbarLinkButton
          view={view}
          onSetLink={this.handleSetLink}
          onRemoveLink={this.handleRemoveLink}
          disabled={!canSetLink}
          selectedLinkNodes={selectedLinkNodes}
        />
        <ToolbarImageButton view={view} />
      </MUIToolbar>
    );
  }
}

const ToolbarDivider = withStyles(styles)(({ classes }) => {
  return <MUIDivider orientation="vertical" className={classes.divider} />;
});

export default withStyles(styles)(Toolbar);
