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

class BaseEditor extends Component {
  _editor = React.createRef();

  state = {
    view: undefined
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

  componentDidMount() {
    const { onViewCreated, ...props } = this.props;
    const view = createProsemirrorView(this._editor.current, props);

    this.setState({ view }, () => onViewCreated(view));
  }

  handleEditorContainerClick = () => {
    const { view } = this.state;

    view.focus();
  };

  render() {
    const { classes, toolbar = false } = this.props;
    const { view } = this.state;

    return (
      <div className={classes.root}>
        {toolbar && (
          <div className={classes.toolbarContainer}>
            <Toolbar view={view} className={classes.toolbar} />
          </div>
        )}

        <div className={classes.editorContainer} onClick={this.handleEditorContainerClick}>
          <div ref={this._editor} className={classes.prosemirror} />
        </div>
      </div>
    );
  }
}

const Editor = withStyles(styles)(BaseEditor);

export default Editor;
