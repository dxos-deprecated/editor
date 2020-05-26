import React from 'react';

import { Editor } from '../src';
import { makeStyles } from '@material-ui/core/styles';

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
