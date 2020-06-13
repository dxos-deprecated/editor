//
// Copyright 2020 Wireline, Inc.
//

import React from 'react';
import { storiesOf } from '@storybook/react';

import { withStyles } from '@material-ui/core/styles';

import { Editor, MarkdownEditor } from '../src';

import { styles, MuiTheme } from './styles';

import Collaborative from './Collaborative';
import CollaborativeDoc from './CollaborativeDoc';

import ContextMenu from './ContextMenu';
import ReactContent from './ReactContent';
import Suggestions from './Suggestions';
import Styled from './Styled';
import CollaborativeMarkdownEditor from './CollaborativeMarkdownEditor';

const RootContainer = story => {
  const RootComponent = withStyles(styles)(({ classes }) => <div className={classes.root}>{story()}</div>);
  return <RootComponent />;
};

storiesOf('Editor', module)
  .addDecorator(MuiTheme)
  .addDecorator(RootContainer)
  .add('Default', () => <Editor />)
  .add('Text only schema', () => <Editor schema='text-only' />)
  .add('Full schema', () => <Editor schema='full' />)
  .add('React content', () => <ReactContent />)
  .add('Context menu', () => <ContextMenu />)
  .add('Suggestions', () => <Suggestions />)
  .add('Styles', () => <Styled />);

storiesOf('Collaborative', module)
  .addDecorator(MuiTheme)
  .addDecorator(RootContainer)
  .add('Default', () => (<Collaborative peers={2} />))
  .add('Using Doc', () => (<CollaborativeDoc peers={2} />));

storiesOf('Editor Toolbar', module)
  .addDecorator(MuiTheme)
  .addDecorator(RootContainer)
  .add('Default', () => <Editor schema='full' toolbar />)
  .add('Custom image popup', () => (
    <Editor
      schema='full'
      toolbar={{
        imagePopupSrcLabel: 'Any image address'
      }}
    />
  ));

storiesOf('Markdown Editor', module)
  .addDecorator(MuiTheme)
  .addDecorator(RootContainer)
  .add('Default', () => <MarkdownEditor />)
  .add('With sync', () => <CollaborativeMarkdownEditor peers={2} />);
