import React from 'react';

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

const SourceCodeEditor = ({ language = '', highlight = true, highlightTheme = 'github', ...props }) => {
  const classes = useEditorStyles();

  return (
    <Editor
      schema='sourceCode'
      language={language}
      prosemirrorPlugins={[highlightPlugin(language, highlightTheme)]}
      classes={classes}
      {...props}
    />
  );
};

export default SourceCodeEditor;
