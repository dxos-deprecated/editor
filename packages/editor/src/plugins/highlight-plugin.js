//
// Copyright 2020 Wireline, Inc.
//

import { highlightPlugin } from 'prosemirror-highlightjs';

import hljs from 'highlight.js/lib/core';

import 'highlight.js/styles/github.css';

const buildPlugin = language => {
  if (language) {
    hljs.configure({
      languages: [language]
    });
  }

  return highlightPlugin(hljs);
};

export default buildPlugin;
