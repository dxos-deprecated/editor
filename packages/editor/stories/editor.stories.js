//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import * as Y from 'yjs';

import CssBaseline from '@material-ui/core/CssBaseline';
import {
  MuiThemeProvider,
  createMuiTheme,
  withStyles
} from '@material-ui/core/styles';

import { grey } from '@material-ui/core/colors';

import Button from '@material-ui/core/Button';
import ListItemText from '@material-ui/core/ListItemText';

import { getContentAsMarkdown } from '@wirelineio/yjs-helpers';

import {
  buildReactElementNodeView,
  addReactElementSchemaSpec
} from './react-node-view';

import { Channel, Editor } from '../src';

const MuiTheme = story => (
  <MuiThemeProvider theme={createMuiTheme()}>
    <CssBaseline />
    {story()}
  </MuiThemeProvider>
);

const styles = theme => ({
  contextMenuItemText: {
    fontSize: 12,
    padding: 0
  },

  contextMenuItemTextRight: {
    float: 'right',
    marginLeft: 5,
    color: grey[500],
    textTransform: 'Capitalize'
  },

  editorGrid: {
    display: 'flex',

    '& > *': {
      flex: 1
    }
  },

  markdownView: {
    fontSize: '1rem',
    padding: theme.spacing(1),
    backgroundColor: '#fff',
    margin: 0,
    border: '1px solid #ccc'
  }
});

class BasicEditor extends Component {
  render() {
    const {
      id,
      doc,
      contentChannel,
      statusChannel,
      onGetUsername,
      onContextMenuGetOptions,
      onContextMenuOptionSelect,
      onContextMenuRenderItem,
      nodeViews = {},
      schemaEnhancers = [],
      onViewCreated = () => null
    } = this.props;

    if (!doc) return 'Loading...';

    return (
      <Editor
        doc={doc}
        contentSync={{
          channel: contentChannel
        }}
        statusSync={{
          id,
          getUsername: onGetUsername,
          channel: statusChannel
        }}
        contextMenu={{
          getOptions: onContextMenuGetOptions,
          onSelect: onContextMenuOptionSelect,
          renderItem: onContextMenuRenderItem
        }}
        nodeViews={nodeViews}
        schemaEnhancers={schemaEnhancers}
        onViewCreated={onViewCreated}
      />
    );
  }
}

class BasicSync extends Component {
  state = {
    editors: undefined,
    showMarkdown: undefined
  };

  componentDidMount() {
    const { editorsCount = 1 } = this.props;

    const editors = Array.from({ length: editorsCount }).reduce(
      (editors, _, idx) => {
        editors[idx] = this.createEditor(idx, `editor-${idx}`);
        return editors;
      },
      {}
    );

    this.setState({ editors });
  }

  componentWillUnmount() {
    const { editors } = this.state;
    Object.values(editors).forEach(editor => {
      editor.doc.off('update', this.handleDocUpdated(editor.id));
    });
  }

  handleDocUpdated = editorId => () => {
    const { editors } = this.state;

    const newEditors = { ...editors };

    newEditors[editorId].markdown = getContentAsMarkdown(
      newEditors[editorId].doc,
      newEditors[editorId].view.state.schema
    );

    this.setState({ editors: newEditors });
  };

  createEditor = (id, username) => {
    // View's doc mock
    const doc = new Y.Doc();

    doc.on('update', this.handleDocUpdated(id));

    const contentChannel = new Channel();
    const statusChannel = new Channel();

    contentChannel.on('local', data => {
      const { editors } = this.state;

      // Update view's doc
      Y.applyUpdate(doc, data.update, data.origin);

      Object.values(editors)
        .filter(editor => editor.id !== id)
        .forEach(editor => {
          editor.contentChannel.receive({ ...data, author: editor.id });
        });
    });

    contentChannel.on('remote', data => {
      // Update view's doc
      Y.applyUpdate(doc, data.update, data.origin);
    });

    statusChannel.on('local', data => {
      const { editors } = this.state;

      Object.values(editors)
        .filter(editor => editor.id !== id)
        .forEach(editor => {
          editor.statusChannel.receive(data);
        });
    });

    return {
      id,
      username,
      doc,
      contentChannel,
      statusChannel
    };
  };

  handleGetUsername = editorId => id => {
    const { editors } = this.state;

    if (!id) return editors[editorId].username;

    return editors[id].username;
  };

  handleContextMenuGetOptions = () => {
    return [
      { id: 1, label: 'Insert some text' },
      { id: 2, label: 'Insert some text 2' }
    ];
  };

  handleContextMenuRenderItem = ({ option }) => {
    const { classes } = this.props;

    return (
      <ListItemText
        primary={<>{option.label}</>}
        className={classes.contextMenuItemText}
      />
    );
  };

  handleContextMenuOptionSelect = async (option, view) => {
    const { tr } = view.state;

    view.state.selection.replaceWith(tr, view.state.schema.text('-SOME TEXT-'));

    view.dispatch(tr);
  };

  handleViewCreated = editorId => view => {
    const { onViewCreated = () => null } = this.props;
    const { editors } = this.state;

    const newEditors = { ...editors };

    newEditors[editorId].view = view;

    this.setState({ editors: newEditors });

    onViewCreated(view);
  };

  render() {
    const {
      exportMarkdown,
      nodeViews = {},
      schemaEnhancers = [],
      classes
    } = this.props;
    const { editors } = this.state;

    if (!editors) return 'Loading...';

    return Object.values(editors).map(editor => {
      return (
        <div key={editor.id} className={classes.editorGrid}>
          <BasicEditor
            nodeViews={nodeViews}
            schemaEnhancers={schemaEnhancers}
            onViewCreated={this.handleViewCreated(editor.id)}
            onGetUsername={this.handleGetUsername(editor.id)}
            onContextMenuGetOptions={this.handleContextMenuGetOptions}
            onContextMenuOptionSelect={this.handleContextMenuOptionSelect}
            onContextMenuRenderItem={this.handleContextMenuRenderItem}
            {...editor}
          />
          {exportMarkdown && (
            <pre className={classes.markdownView}>{editor.markdown}</pre>
          )}
        </div>
      );
    });
  }
}

const BasicSyncWithStyles = withStyles(styles)(BasicSync);

class WithReactComponent extends Component {
  handleRenderReactNodeView = node => {
    return (
      <Button
        onClick={e => {
          e.preventDefault();
          console.log('From react!', JSON.stringify(node, null, 2));
        }}
      >
        I&apos;m a react button
      </Button>
    );
  };

  handleViewCreated = view => {
    const reactElement = view.state.schema.node('reactelement');

    view.dispatch(view.state.tr.insert(0, reactElement));
  };

  render() {
    return (
      <BasicSyncWithStyles
        schemaEnhancers={[addReactElementSchemaSpec]}
        nodeViews={{
          reactelement: buildReactElementNodeView(
            this.handleRenderReactNodeView
          )
        }}
        onViewCreated={this.handleViewCreated}
      />
    );
  }
}

storiesOf('Editor', module)
  .addDecorator(MuiTheme)
  .add('Basic', () => <BasicSyncWithStyles editorsCount={1} />)
  .add('Markdown export', () => (
    <BasicSyncWithStyles editorsCount={2} exportMarkdown />
  ))
  .add('React component', () => <WithReactComponent />);
