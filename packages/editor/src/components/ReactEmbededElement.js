//
// Copyright 2020 DXOS.org
//

import React from 'react';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  '@global': {
    '.ProseMirror blockreactelement, .ProseMirror inlinereactelement': {
      verticalAlign: 'bottom',
      position: 'relative',
      userSelect: 'none'
    },

    '.ProseMirror blockreactelement': {
      display: 'block'
    },

    '.ProseMirror inlinereactelement': {
      display: 'inline-block'
    }
  },

  root: {
    '&.selected': {
      outline: `thin solid ${theme.palette.primary.main}`
    }
  }
}));

const ReactEmbededElement = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classnames('react-element-content', classes.root)}>
      {children}
    </div>
  );
};

export default ReactEmbededElement;
