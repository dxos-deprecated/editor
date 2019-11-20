//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import { toggleMark, setBlockType } from 'prosemirror-commands';

import { withStyles } from '@material-ui/core';

import { createProsemirrorView } from '../lib/prosemirror-view';
import { schema } from '../lib/schema';

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
  _view = null;

  _editor = React.createRef();

  state = {
    activeMarks: {},
    canUndo: false,
    canRedo: false
  };

  componentDidMount() {
    const { doc, changes, status, contextMenu = {} } = this.props;

    const { view, history } = createProsemirrorView({
      element: this._editor.current,
      doc,
      changes,
      status,
      contextMenu,
      onChange: this.handleContentChange,
      onHistoryChange: this.handleHistoryChange,
      options: {
        initialFontSize: EDITOR_FONT_SIZE
      }
    });

    this._view = view;
    this._history = history;
  }

  componentWillUnmount() {
    this.destroyEditor();
  }

  handleContentChange = ({ activeMarks }) => {
    this.setState({ activeMarks });
  };

  handleHistoryChange = ({ canUndo, canRedo }) => {
    this.setState({ canUndo, canRedo });
  };

  handleMarkButtonClick = name => {
    const markType = schema.marks[name];
    toggleMark(markType)(this._view.state, this._view.dispatch);
    this._view.focus();
  };

  handleNodeTypeButtonClick = (name, attrs) => {
    setBlockType(schema.nodes[name], attrs)(
      this._view.state,
      this._view.dispatch
    );
    this._view.focus();
  };

  handleHistoryButtonClick = type => {
    this._history[type](this._view.state);
    this._view.focus();
  };

  destroyEditor() {
    if (!this._view) {
      return;
    }

    try {
      this._view.destroy();
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    const { classes } = this.props;
    const { activeMarks, canUndo, canRedo } = this.state;

    return (
      <div className={classes.root}>
        <Toolbar
          activeMarks={activeMarks}
          onMarkButtonClick={this.handleMarkButtonClick}
          onNodeTypeButtonClick={this.handleNodeTypeButtonClick}
          onHistoryButtonClick={this.handleHistoryButtonClick}
          canUndo={canUndo}
          canRedo={canRedo}
        />
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
