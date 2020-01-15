//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Toolbar from './Toolbar';

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
    const {
      onViewCreated,
      schema,
      contextMenu,
      sync,
      nodeViews,
      schemaEnhancers,
      options,
      onContentChange,
    } = this.props;

    const view = createProsemirrorView(this._editor.current, {
      schema: sync ? 'full' : schema,
      contextMenu,
      sync,
      nodeViews,
      schemaEnhancers,
      options,
      onContentChange
    });

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

const Editor = withStyles(styles)(EditorComponent);

EditorComponent.defaultProps = {
  toolbar: false,
  onViewCreated: () => null,
  ...defaultViewProps
};

EditorComponent.propTypes = {
  toolbar: PropTypes.bool,
  schema: PropTypes.oneOfType([
    PropTypes.oneOf(['basic', 'text-only', 'full']),
    PropTypes.shape({ // https://prosemirror.net/docs/ref/#model.SchemaSpec
      nodes: PropTypes.object,
      marks: PropTypes.object
    })
  ]),
  contextMenu: PropTypes.oneOfType([
    PropTypes.oneOf([false]),
    PropTypes.shape({
      getOptions: PropTypes.func,
      onSelect: PropTypes.func,
      renderItem: PropTypes.func
    })
  ]),
  sync: PropTypes.shape({
    content: PropTypes.exact({
      channel: PropTypes.instanceOf(Channel)
    }),
    status: PropTypes.exact({
      channel: PropTypes.instanceOf(Channel),
      id: PropTypes.string,
      getUsername: PropTypes.func
    }),
    doc: (props, propName, componentName) => {
      if (!(props[propName].constructor instanceof Y.Doc.constructor)) {
        return new Error(
          'Invalid prop `' + propName + '` supplied to' +
          ' `' + componentName + '`. Validation failed.'
        );
      }
    }
  }),
  nodeViews: PropTypes.object, // https://prosemirror.net/docs/ref/#view.NodeView
  schemaEnhancers: PropTypes.arrayOf(PropTypes.func),
  options: PropTypes.shape({
    initialFontSize: PropTypes.number
  }),
  onContentChange: PropTypes.func,
  onViewCreated: PropTypes.func
};

export default Editor;
