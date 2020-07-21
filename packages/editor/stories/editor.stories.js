//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { storiesOf } from '@storybook/react';

import { withStyles } from '@material-ui/core/styles';

import { Editor, SourceCodeEditor } from '../src';

import { styles, MuiTheme } from './styles';

import Collaborative from './Collaborative';
import CollaborativeDoc from './CollaborativeDoc';

import ContextMenu from './ContextMenu';
import ReactContent from './ReactContent';
import Suggestions from './Suggestions';
import Styled from './Styled';
import CollaborativeSourceCodeEditor from './CollaborativeSourceCodeEditor';
import MarkdownPreview from './MarkdownPreview';
import Scroll from './Scroll';
import LongText from './LongText';

const RootContainer = story => {
  const RootComponent = withStyles(styles)(({ classes }) => <div className={classes.root}>{story()}</div>);
  return <RootComponent />;
};

const buildStoriesOf = name => storiesOf(name, module)
  .addDecorator(MuiTheme)
  .addDecorator(RootContainer);

buildStoriesOf('Editor')
  .add('Default', () => <Editor />)
  .add('Text only schema', () => <Editor schema='text-only' />)
  .add('Full schema', () => <Editor schema='full' />)
  .add('Context menu', () => <ContextMenu />)
  .add('Suggestions', () => <Suggestions />)
  .add('Initial content', () => <Editor initialContent={'<p>Hi <strong>YOU!</strong></p>'} />)
  .add('Styles', () => <Styled />)
  .add('Scroll', () => <Scroll />)
  .add('Long Text', () => <LongText />);

buildStoriesOf('React content')
  .add('Basic', () => <ReactContent />);

buildStoriesOf('Collaborative')
  .add('Default', () => (<Collaborative peers={2} />))
  .add('Using Doc', () => (<CollaborativeDoc peers={2} />));

buildStoriesOf('Editor Toolbar')
  .add('Default', () => <Editor toolbar />)
  .add('Schema full', () => <Editor schema='full' toolbar />)
  .add('Schema text-only', () => <Editor schema='text-only' toolbar />)
  .add('Custom image popup', () => (
    <Editor
      schema='full'
      toolbar={{
        imagePopupSrcLabel: 'Any image address'
      }}
    />
  ));

buildStoriesOf('Source code editor')
  .add('Default (Plain text)', () => <SourceCodeEditor />)
  .add('Javascript syntax', () => <SourceCodeEditor language='javascript' />)
  .add('Disable highlight', () => <SourceCodeEditor highlight={false} />)
  .add('Markdown preview', () => <MarkdownPreview />)
  .add('Synced Markdown', () => <CollaborativeSourceCodeEditor peers={2} language='markdown' />)
  .add('Synced Javascript', () => <CollaborativeSourceCodeEditor peers={2} language='javascript' />);
