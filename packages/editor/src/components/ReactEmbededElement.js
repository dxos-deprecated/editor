//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core';

const useClasses = makeStyles(theme => ({
  '@global': {
    '.ProseMirror reactelement': {
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
      display: 'inline-block',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default'
    }
  },

  root: {
    padding: theme.spacing(0.5)
  },

  selected: {
    padding: theme.spacing(0.3),
    border: `${theme.spacing(0.2)}px solid ${theme.palette.primary.light}`
  }
}));

const ReactEmbededElement = ({ prosemirrorNode, selected = false, onCreated }) => {
  const { attrs: { props = {} } } = prosemirrorNode;

  const classes = useClasses({ selected });
  const reactDomContent = useRef(null);

  useEffect(() => {
    onCreated(reactDomContent.current, props);
  }, []);

  return (
    <div
      className={classnames(classes.root, selected && classes.selected)}
    >
      <div className={classes.content} ref={reactDomContent} />
    </div>
  );
};

export default ReactEmbededElement;
