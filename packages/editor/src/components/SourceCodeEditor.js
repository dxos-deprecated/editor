//
// Copyright 2020 DXOS.org
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

  editor: highlight => (highlight ? {
    height: '100%',

    '& > pre, & > pre > code': {
      height: '100%'
    },

    // Based on highlight.js default theme
    '& > pre > code.hljs': {
      display: 'block',
      color: '#444',

      '& > .hljs-subst': { color: '#444' },

      '& > .hljs-comment': { color: '#888888' },

      '& > .hljs-keyword, & > .hljs-attribute, & > .hljs-selector-tag, & > .hljs-meta-keyword, & > .hljs-doctag, & > .hljs-name': {
        fontWeight: 'bold'
      },

      '& > .hljs-type, & > .hljs-string, & > .hljs-number, & > .hljs-selector-id, & > .hljs-selector-class, & > .hljs-quote, & > .hljs-template-tag, & > .hljs-deletion': {
        color: '#880000'
      },

      '& > .hljs-title, & > .hljs-section': { color: '#880000', fontWeight: 'bold' },

      '& > .hljs-regexp, & > .hljs-symbol, & > .hljs-variable, & > .hljs-template-variable, & > .hljs-link, & > .hljs-selector-attr, & > .hljs-selector-pseudo': {
        color: '#BC6060'
      },

      '& > .hljs-literal': { color: '#78A960' },

      '& > .hljs-built_in, & > .hljs-bullet, & > .hljs-code, & > .hljs-addition': {
        color: '#397300'
      },

      '& > .hljs-meta': { color: '#1f7199' },

      '& > .hljs-meta-string': { color: '#4d99bf' },

      '& > .hljs-emphasis': { fontStyle: 'italic' },

      '& > .hljs-strong': { fontWeight: 'bold' }
    }
  } : {})
}));

const SourceCodeEditor = ({ language = '', highlight = true, onContentChange = () => null, ...props }) => {
  const classes = useEditorStyles(highlight);

  const prosemirrorPlugins = [];
  if (highlight) {
    prosemirrorPlugins.push(highlightPlugin(language));
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
