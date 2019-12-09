//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';

import prosemirrorStyles from '../styles/prosemirror';

import { createProsemirrorView } from '../lib/prosemirror-view';

import Toolbar from './Toolbar';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'stretch',
    padding: theme.spacing(0.5)
  },

  editorContainer: {
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(2),
    backgroundColor: '#fff'
  },

  toolbarContainer: {
    flex: '0 1 auto'
  }
});

/**
 * Editor component.
 */
class Editor extends Component {
  _editor = React.createRef();

  state = {
    view: undefined
  };

  componentDidMount() {
    const {
      doc,
      contentSync,
      statusSync,
      contextMenu = {},
      nodeViews = {},
      onViewCreated = () => null
    } = this.props;

    const view = createProsemirrorView({
      element: this._editor.current,
      doc,
      contentSync,
      statusSync,
      contextMenu,
      nodeViews,
      options: {
        initialFontSize: 22
      }
    });

    this.setState({ view: view });

    onViewCreated(view);
  }

  handleEditorContainerClick = () => {
    const { view } = this.state;

    view.focus();
  };

  componentWillUnmount() {
    const { view } = this.state;

    if (!view) {
      return;
    }

    this.setState({ view: undefined });

    try {
      view.destroy();
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    const { classes } = this.props;
    const { view } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.toolbarContainer}>
          <Toolbar view={view} className={classes.toolbar} />
        </div>

        <div
          className={classes.editorContainer}
          onClick={this.handleEditorContainerClick}
        >
          <div ref={this._editor} className={classes.prosemirror} />
        </div>
      </div>
    );
  }
}

export default withStyles(theme => ({
  ...styles(theme),
  ...prosemirrorStyles(theme)
}))(Editor);
