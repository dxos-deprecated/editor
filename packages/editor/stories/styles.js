//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import CssBaseline from '@material-ui/core/CssBaseline';

export const MuiTheme = story => (
  <MuiThemeProvider theme={createMuiTheme()}>
    <CssBaseline />

    {story()}
  </MuiThemeProvider>
);

export const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden'
  },

  container: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    flexShrink: 0,
    overflow: 'hidden',
    borderBottom: '2px solid #333'
  },

  markdown: {
    display: 'flex',
    flex: 1,
    margin: 0,
    padding: theme.spacing(1),
    backgroundColor: '#F5F5F5',
    fontSize: 'large'
  }
});
