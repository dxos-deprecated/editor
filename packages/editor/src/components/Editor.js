//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';

import { createProsemirrorView } from '../lib/prosemirror-view';

import Toolbar from './Toolbar';

const EDITOR_FONT_SIZE = 22;

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

  editor: {
    margin: 0,
    outline: 'none',
    fontSize: EDITOR_FONT_SIZE,
    whiteSpace: 'pre-wrap',
    flex: 1,
    minHeight: '100%',
    width: '100%',

    '& p': {
      marginTop: '1em',
      marginBottom: '1em'
    },

    '& .status': {
      display: 'inline-block',
      position: 'relative',
      userSelect: 'none'
    },

    '& .status > .cursor': {
      opacity: '0.3',
      display: 'inline-block',
      width: theme.spacing(0.5),
      marginRight: theme.spacing(1) * -0.5,
      cursor: 'text'
    },

    '& .status > .username': {
      color: 'white',
      top: '0',
      left: '0',
      width: 'auto',
      overflow: 'visible',
      position: 'absolute',
      display: 'table',
      transform: 'translateY(-100%)',
      fontSize: '0.8rem',
      padding: `${theme.spacing(0.25)}px ${theme.spacing(1)}px`,
      whiteSpace: 'nowrap'
    }
  }
});

/**
 * Editor component.
 */
class Editor extends Component {
  _editor = React.createRef();

  state = {
    prosemirrorView: undefined,
  };

  componentDidMount() {
    const { doc, contentSync, statusSync, contextMenu = {} } = this.props;

    const view = createProsemirrorView({
      element: this._editor.current,
      doc,
      contentSync,
      statusSync,
      contextMenu,
      options: {
        initialFontSize: EDITOR_FONT_SIZE
      }
    });

    this.setState({ prosemirrorView: view });
  }

  componentWillUnmount() {
    this.destroyEditor();
  }

  destroyEditor() {
    const { prosemirrorView } = this.state;
    if (!prosemirrorView) {
      return;
    }

    try {
      prosemirrorView.destroy();
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    const { classes } = this.props;
    const { prosemirrorView } = this.state;

    return (
      <div className={classes.root}>
        {prosemirrorView && (
          <Toolbar
            view={prosemirrorView}
          // activeMarks={activeMarks}
          // onMarkButtonClick={this.handleMarkButtonClick}
          // onNodeTypeButtonClick={this.handleNodeTypeButtonClick}
          // onHistoryButtonClick={this.handleHistoryButtonClick}
          // onWrapperButtonClick={this.handleWrapperButtonClick}
          // canUndo={canUndo}
          // canRedo={canRedo}
          />
        )}
        <div className={classes.editorContainer}>
          <div
            ref={this._editor}
            className={classes.editor}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Editor);
