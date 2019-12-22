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
    flex: 1
  },

  editorContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(1),
    backgroundColor: '#FFF'
  },

  toolbarContainer: {
    flex: '0 1 auto'
  },

  ...prosemirrorStyles(theme)
});

/**
 * Editor component.
 */
class Editor extends Component {
  _editor = React.createRef();

  state = {
    view: undefined
  };

  handleEditorContainerClick = () => {
    const { view } = this.state;

    view.focus();
  };

  componentDidMount() {
    const {
      doc,
      contentSync,
      statusSync,
      contextMenu = {},
      nodeViews = {},
      onViewCreated = () => null,
      schemaEnhancers = []
    } = this.props;

    const view = createProsemirrorView({
      element: this._editor.current,
      doc,
      contentSync,
      statusSync,
      contextMenu,
      nodeViews,
      schemaEnhancers,
      options: {
        initialFontSize: 22
      }
    });

    this.setState({ view }, () => {
      onViewCreated(view);
    });
  }

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

        <div className={classes.editorContainer} onClick={this.handleEditorContainerClick}>
          <div ref={this._editor} className={classes.prosemirror} />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Editor);
