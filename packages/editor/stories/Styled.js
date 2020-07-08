//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import { Editor } from '../src';

const useToolbarStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'grey'
  }
}));

const useEditorStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'blue'
  }
}));

const Styled = () => {
  const toolbarClasses = useToolbarStyles();
  const editorClasses = useEditorStyles();

  return (
    <Editor
      toolbar={{
        classes: toolbarClasses
      }}
      classes={{
        editor: editorClasses.root
      }}
    />
  );
};

export default Styled;
