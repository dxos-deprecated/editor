//
// Copyright 2020 Wireline, Inc.
//

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { withStyles } from '@material-ui/core/styles';

import Toolbar from './Toolbar';
import ContextMenu from './ContextMenu';
import Suggestions from './Suggestions';

import { createProsemirrorEditor, defaultEditorProps } from '../lib/prosemirror-editor';

import 'prosemirror-view/style/prosemirror.css';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    maxHeight: '100%'
  },

  editorContainer: {
    flexGrow: 1,
    overflow: 'auto',
    backgroundColor: '#ffffff',
    cursor: 'text',
    wordBreak: 'break-word'
  },

  editor: {
    padding: theme.spacing(1),
    backgroundColor: '#ffffff',
    fontSize: 22,
    outline: 'none',
    '-webkit-font-variant-ligatures': 'none',
    fontVariantLigatures: 'none',
    fontFeatureSettings: '"liga" 0',

    '& pre': {
      whiteSpace: 'pre-wrap',
      backgroundColor: theme.palette.grey[200],
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      padding: theme.spacing(1)
    },

    '& > p': {
      marginTop: '.5em',
      marginBottom: '.5em'
    },

    '& > p a.hovered': {
      cursor: 'pointer'
    },

    '& .cursor': {
      position: 'relative',
      marginLeft: -1.5,
      marginRight: -1.5,
      borderLeft: '1.5px solid',
      borderRight: '1.5px solid',
      wordBreak: 'normal',
      pointerEvents: 'none',

      '& > .name': {
        position: 'absolute',
        transform: 'translateY(-100%)',
        top: '0',
        left: -1.5,
        padding: '1px 4px',
        color: 'white',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        fontSize: 12
      }
    }
  },

  toolbarContainer: {
    flex: '0 1 auto'
  }
});

class EditorComponent extends Component {
  static defaultProps = {
    toolbar: undefined,
    onCreated: undefined,
    prosemirrorPlugins: defaultEditorProps.plugins,
    classes: {},
    ...defaultEditorProps
  };

  _editorDOM = React.createRef();

  state = {
    editor: undefined,
    toolbar: undefined,
    reactElements: []
  };

  static getDerivedStateFromProps (props) {
    const { toolbar } = props;

    return {
      toolbar
    };
  }

  componentDidMount () {
    this.init();
  }

  componentWillUnmount () {
    this.destroy();
  }

  createEditor = (editorConfig) => {
    const { onCreated } = this.props;

    const editor = createProsemirrorEditor(this._editorDOM.current, {
      ...editorConfig,
      onReactElementDomCreated: this.handleReactElementDomCreated,
      plugins: editorConfig.prosemirrorPlugins
    });

    this.setState({ editor }, () => onCreated ? onCreated({
      ...editor,
      destroy: this.destroy,
      init: this.init,
      reset: this.reset
    }) : null);
  }

  reset = () => {
    this.destroy();
    this.init();
  }

  init = () => {
    this.createEditor(this.props);
  }

  destroy = () => {
    this.destroyEditor();

    this.setState({
      editor: undefined,
      toolbar: undefined,
      reactElements: []
    });
  }

  destroyEditor = () => {
    const { editor } = this.state;

    try {
      editor.destroy();
    } catch (err) { } // eslint-disable-line no-empty
  }

  handleReactElementDomCreated = (dom, props) => {
    this.setState(state => ({ reactElements: [...state.reactElements, { dom, props }] }));
  }

  handleEditorContainerClick = () => {
    const { editor } = this.state;

    editor.view.focus();
  };

  handleEditorClick = event => {
    // Avoid root click handler (handleEditorContainerClick)
    event.stopPropagation();
  };

  handleEditorContainerContextMenu = event => {
    event.preventDefault();

    const { editor } = this.state;
    editor.view.focus();
    const contextMenuEvent = new MouseEvent('mouseup', { button: 2 });
    this._editorDOM.current.dispatchEvent(contextMenuEvent);
  };

  render () {
    const { schema, sync, contextMenu, suggestions, reactElementRenderFn, classes } = this.props;
    const { editor = {}, toolbar, reactElements } = this.state;

    const showToolbar = toolbar && (schema === 'full' || sync);

    return (
      <div className={classes.root}>
        {suggestions && <Suggestions view={editor.view} {...suggestions} />}
        {contextMenu && <ContextMenu view={editor.view} {...contextMenu} />}
        {showToolbar && (
          <div className={classes.toolbarContainer}>
            <Toolbar
              view={editor && editor.view}
              {...toolbar}
            />
          </div>
        )}

        <div
          onClick={this.handleEditorContainerClick}
          onContextMenu={this.handleEditorContainerContextMenu}
          className={classes.editorContainer}
        >
          <div
            ref={this._editorDOM}
            className={classes.editor}
            onClick={this.handleEditorClick}
            spellCheck={false}
          />
        </div>

        {
          // Placeholders of React.Portals to real components
          reactElements.map(({ dom, props }, i) => (
            ReactDOM.createPortal(
              reactElementRenderFn({ key: i, ...props }),
              dom
            )
          ))
        }
      </div>
    );
  }
}

const Editor = withStyles(styles)(EditorComponent);

export default Editor;
