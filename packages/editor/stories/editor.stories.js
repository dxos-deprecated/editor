//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';
import { storiesOf } from '@storybook/react';

import { withStyles } from '@material-ui/core/styles';

import { Editor } from '../src';

import { styles, MuiTheme } from './styles';

import Collaborative from './Collaborative';
import ContextMenu from './ContextMenu';
import ReactContent from './ReactContent';

const RootContainer = story => {
  const RootComponent = withStyles(styles)(({ classes }) => <div className={classes.root}>{story()}</div>);
  return <RootComponent />;
};

storiesOf('Editor', module)
  .addDecorator(MuiTheme)
  .addDecorator(RootContainer)
  .add('Default', () => <Editor />)
  .add('Text only schema', () => <Editor schema="text-only" />)
  .add('Full schema', () => <Editor schema="full" />)
  .add('Toolbar', () => <Editor schema="full" toolbar />)
  .add('Collaborative', () => <Collaborative editorsCount={2} />)
  .add('React content', () => <ReactContent />)
  .add('Context menu', () => <ContextMenu />);
