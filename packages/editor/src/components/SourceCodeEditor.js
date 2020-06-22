//
// Copyright 2020 Wireline, Inc.
//

import React, { useCallback } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Editor from './Editor';

import highlightPlugin from '../plugins/highlight-plugin';

const useEditorStyles = makeStyles(() => ({
  root: {
    fontFamily: 'monospace',

    '& pre': {
      margin: 0,
      padding: 0,
      backgroundColor: 'inherit'
    }
  },

  editor: {
    height: '100%',

    '& > pre, & > pre > code': {
      height: '100%'
    }
  }
}));

const SourceCodeEditor = ({ language = '', highlight = true, highlightTheme = 'github', onContentChange = () => null, ...props }) => {
  const classes = useEditorStyles();

  const prosemirrorPlugins = [];
  if (highlight) {
    prosemirrorPlugins.push(highlightPlugin(language, highlightTheme));
  }

  const handleContentChange = useCallback((html, prosemirrorDoc) => {
    onContentChange(prosemirrorDoc.textContent);
  }, []);

  return (
    <Editor
      schema='source-code'
      language={language}
      prosemirrorPlugins={prosemirrorPlugins}
      onContentChange={handleContentChange}
      classes={classes}
      {...props}
    />
  );
};

export default SourceCodeEditor;
