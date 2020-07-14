//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useRef } from 'react';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  '@global': {
    '.ProseMirror reactelement': {
      position: 'relative'
    },

    '.ProseMirror reactelement.ProseMirror-selectednode': {
      border: `${theme.spacing(0.2)}px solid ${theme.palette.primary.light}`
    }
  },

  root: {
    padding: theme.spacing(0.2),

    '.ProseMirror reactelement.ProseMirror-selectednode > &': {
      padding: 0
    }
  }
}));

const ReactEmbededElement = ({ prosemirrorNode, onCreated }) => {
  const { attrs: { props = {} } } = prosemirrorNode;

  const classes = useStyles();
  const reactDomContent = useRef(null);

  useEffect(() => {
    onCreated(reactDomContent.current, props);
  }, []);

  return (
    <div className={classes.root}>
      <div ref={reactDomContent} />
    </div>
  );
};

export default ReactEmbededElement;
