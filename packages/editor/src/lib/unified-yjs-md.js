//
// Copyright 2019 Wireline, Inc.
//

import unified from 'unified';
import parse from 'rehype-parse';
import rehype2remark from 'rehype-remark';
import stringify from 'remark-stringify';

const tagReplacements = {
  paragraph: () => ({ tag: 'p' }),
  heading: element => ({
    tag: `h${element.properties.level}`,
    attrsToRemove: ['level']
  }),
  underline: () => ({ tag: 'u' }),
  horizontal_rule: () => ({ tag: 'hr' }),
  code_block: () => ({ tag: 'pre' }),
  hard_break: () => ({ tag: 'br' }),
  list_item: () => ({ tag: 'li' }),
  ordered_list: () => ({ tag: 'ol' }),
  bullet_list: () => ({ tag: 'ul' })
};

const replaceableTags = Object.keys(tagReplacements);

function treeTransformer() {
  return transformer;

  function replaceTag(element, tagReplacement) {
    element.tagName = tagReplacement.tag;
  }

  function removeAttrs(element, tagReplacement) {
    if (tagReplacement.attrsToRemove) {
      tagReplacement.attrsToRemove.forEach(
        attr => delete element.properties[attr]
      );
    }
  }

  function transformTagName(element) {
    if (element.type === 'text') return element;

    element.children = element.children.map(transformTagName);

    if (replaceableTags.includes(element.tagName)) {
      const tagReplacement = tagReplacements[element.tagName](element);

      replaceTag(element, tagReplacement);
      removeAttrs(element, tagReplacement);
    }

    return element;
  }

  function transformer(tree) {
    // 0.root -> 0.head,1.body
    tree.children[0].children[1] = transformTagName(
      tree.children[0].children[1]
    );
  }
}

const processor = unified()
  .use(parse, { emitParseErrors: true, duplicateAttribute: false })
  .use(treeTransformer)
  .use(rehype2remark)
  .use(stringify);

const xmlFragmentToMarkdown = xmlFragment => {
  const parsed = processor.processSync(xmlFragment.toString());

  return parsed.toString();
};

export default xmlFragmentToMarkdown;
