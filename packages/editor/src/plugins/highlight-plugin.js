
import { highlightPlugin } from 'prosemirror-highlightjs';

import hljs from 'highlight.js/lib/core';

export default (language, theme) => {
  if (language) {
    hljs.configure({
      languages: [language]
    });
  }

  require(`highlight.js/styles/${theme}.css`);

  return highlightPlugin(hljs);
};
