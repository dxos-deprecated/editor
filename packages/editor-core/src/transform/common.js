//
// Copyright 2020 DXOS.org
//

import rehypeParse from 'rehype-parse';
import remarkBreaks from 'remark-breaks';
import remarkParse from 'remark-parse';
import remarkBlockElements from 'remark-parse/lib/block-elements';
import unified from 'unified';

export function htmlProcessor (processor = unified()) {
  return processor.use(rehypeParse, { fragment: true });
}

export function markdownProcessor (processor = unified()) {
  return processor
    .use(remarkParse, {
      blocks: [...remarkBlockElements, 'block_react_element']
    })
    .use(remarkBreaks);
}
