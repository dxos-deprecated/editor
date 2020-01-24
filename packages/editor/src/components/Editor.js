//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';

import { Document } from '@wirelineio/document';

import { withStyles } from '@material-ui/core/styles';

import Toolbar, { ToolbarPropTypes } from './Toolbar';

import prosemirrorStyles from '../styles/prosemirror';

import { createProsemirrorView, defaultViewProps } from '../lib/prosemirror-view';
import Channel from '../lib/Channel';

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
      sync,
      nodeViews,
      schemaEnhancers,
      options,
      onContentChange,
      onKeyDown
    };

    const view = createProsemirrorView(this._editor.current, viewConfig);
    view.id = uuid();

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

  render() {
    const { classes } = this.props;
    const { view, toolbar } = this.state;

    return (
      <div className={classes.root}>
        {toolbar && (
          <div className={classes.toolbarContainer}>
            <Toolbar view={view} className={classes.toolbar} {...toolbar} />
          </div>
        )}

        <div className={classes.editorContainer} onClick={this.handleEditorContainerClick}>
          <div ref={this._editor} className={classes.editor} />
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
  contextMenu: PropTypes.shape({
    getOptions: PropTypes.func,
    onSelect: PropTypes.func,
    renderItem: PropTypes.func
  }),
  sync: PropTypes.shape({
    status: PropTypes.exact({
      channel: PropTypes.instanceOf(Channel),
      getUsername: PropTypes.func
    }),
    id: PropTypes.string,
    document: PropTypes.instanceOf(Document)
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
    toolbarContainer: PropTypes.string,
    toolbar: PropTypes.string
  })
};

export default Editor;
