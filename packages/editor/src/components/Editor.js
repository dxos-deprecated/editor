//
// Copyright 2020 Wireline, Inc.
//

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { uuidv4 } from 'lib0/random';

import { Document } from '@dxos/document';

import { withStyles } from '@material-ui/core/styles';

import Toolbar, { ToolbarPropTypes } from './Toolbar';
import ContextMenu, { ContextMenuPropTypes } from './ContextMenu';

import { createProsemirrorView, defaultViewProps } from '../lib/prosemirror-view';
import Channel from '../lib/Channel';
import Suggestions, { SuggestionsPropTypes } from './Suggestions';

import 'prosemirror-view/style/prosemirror.css';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
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
    classes: {},
    ...defaultViewProps
  };

  _editor = React.createRef();

  state = {
    /** @type {EditorView} */
    view: undefined,

    toolbar: undefined,
  };

  static getDerivedStateFromProps(props) {
    const { toolbar } = props;

    return {
      toolbar
    };
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.destroy();
  }

  createProsemirrorView = ({
    schema,
    htmlContent,
    contextMenu,
    suggestions,
    sync,
    nodeViews,
    schemaEnhancers,
    options,
    onContentChange,
    onKeyDown
  }) => {

    const {
      onCreated,
    } = this.props;

    const viewConfig = {
      schema: sync ? 'full' : schema,
      htmlContent,
      contextMenu,
      suggestions,
      sync,
      nodeViews,
      schemaEnhancers,
      options,
      onContentChange,
      onKeyDown
    };

    const view = createProsemirrorView(this._editor.current, viewConfig);
    view.id = uuidv4();

    this.setState({ view }, () => onCreated ? onCreated({
      view,
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
    this.createProsemirrorView(this.props);
  }

  destroy = () => {
    this.destroyProsemirrorView();

    this.setState({
      view: undefined,
      toolbar: undefined
    });
  }

  destroyProsemirrorView = () => {
    const { view } = this.state;

    try {
      view.destroy();
    } catch (err) { } // eslint-disable-line no-empty
  }

  handleEditorContainerClick = () => {
    const { view } = this.state;

    view.focus();
  };

  handleEditorClick = event => {
    // Avoid root click handler (handleEditorContainerClick)
    event.stopPropagation();
  };

  render() {
    const { contextMenu, suggestions, classes } = this.props;
    const { view, toolbar } = this.state;

    return (
      <div className={classes.root}>
        {suggestions && <Suggestions view={view} {...suggestions} />}
        {contextMenu && <ContextMenu view={view} {...contextMenu} />}
        {toolbar && (
          <div className={classes.toolbarContainer}>
            <Toolbar view={view} {...toolbar} />
          </div>
        )}

        <div className={classes.editorContainer} onClick={this.handleEditorContainerClick}>
          <div ref={this._editor} className={classes.editor} onClick={this.handleEditorClick} />
        </div>
      </div>
    );
  }
}

const Editor = withStyles(styles)(EditorComponent);

EditorComponent.propTypes = {
  toolbar: PropTypes.oneOfType([
    PropTypes.bool,
    ToolbarPropTypes
  ]),
  htmlContent: PropTypes.string,
  schema: PropTypes.oneOfType([
    PropTypes.oneOf(['basic', 'text-only', 'full']),
    PropTypes.shape({ // https://prosemirror.net/docs/ref/#model.SchemaSpec
      nodes: PropTypes.object,
      marks: PropTypes.object
    })
  ]),
  contextMenu: PropTypes.oneOfType([
    PropTypes.bool,
    ContextMenuPropTypes
  ]),
  suggestions: PropTypes.oneOfType([
    PropTypes.bool,
    SuggestionsPropTypes
  ]),
  sync: PropTypes.shape({
    status: PropTypes.exact({
      channel: PropTypes.instanceOf(Channel),
      getUsername: PropTypes.func
    }),
    id: PropTypes.string,
    document: PropTypes.instanceOf(Document),
    onDocumentLocalUpdate: PropTypes.func
  }),
  nodeViews: PropTypes.object, // https://prosemirror.net/docs/ref/#view.NodeView
  schemaEnhancers: PropTypes.arrayOf(PropTypes.func),
  options: PropTypes.shape({
    initialFontSize: PropTypes.number
  }),
  onContentChange: PropTypes.func,
  onCreated: PropTypes.func,
  onKeyDown: PropTypes.func,
  classes: PropTypes.shape({
    root: PropTypes.string,
    editorContainer: PropTypes.string,
    editor: PropTypes.string,
    toolbarContainer: PropTypes.string
  })
};

export default Editor;
