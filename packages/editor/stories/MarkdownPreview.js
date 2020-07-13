//
// Copyright 2020 DXOS.org
//

import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core';

import { markdownToReact } from '../src/lib/transform';
import { SourceCodeEditor } from '../src';

const useClasses = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    backgroundColor: '#fff'
  },
  preview: {
    flex: 1,
    margin: theme.spacing(1),
    padding: 11,
    border: '1px solid #929292'
  }
}));

export default () => {
  const classes = useClasses();
  const [markdownString, setMarkdownString] = useState('');

  const handleContentChange = useCallback(markdownString => {
    setMarkdownString(markdownString);
  }, []);

  return (
    <div className={classes.root}>
      <SourceCodeEditor
        language='markdown'
        onContentChange={handleContentChange}
      />
      <div className={classes.preview}>
        {markdownToReact(markdownString)}
      </div>
    </div>
  );
};
