//
// Copyright 2020 DXOS.org
//

import { highlightPlugin } from 'prosemirror-highlightjs';

import hljs from 'highlight.js/lib/core';

import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import markdown from 'highlight.js/lib/languages/markdown';
import rust from 'highlight.js/lib/languages/rust';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('c', c);
hljs.registerLanguage('go', go);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('xml', xml);

const buildPlugin = language => {
  hljs.configure({ languages: [language] });

  return highlightPlugin(hljs);
};

export default buildPlugin;
