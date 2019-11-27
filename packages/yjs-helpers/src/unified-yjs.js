//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

import rehype2remark from 'rehype-remark';
import rehypeParse from 'rehype-parse';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import unified from 'unified';

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

function xmlFragmentToMarkdownTreeTransformer() {
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

    if (Object.keys(tagReplacements).includes(element.tagName)) {
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

const xmlFragmentToMarkdownProcessor = unified()
  .use(rehypeParse, { emitParseErrors: true, duplicateAttribute: false })
  .use(xmlFragmentToMarkdownTreeTransformer)
  .use(rehype2remark)
  .use(remarkStringify);

const markdownToXmlFragmentProcessor = unified()
  .use(remarkParse);

const treeNodeToYjsElement = (node) => {

  if (node.type === 'text') {
    return new Y.Text(node.value);
  }

  const xmlElement = new Y.XmlElement(node.type);

  if (node.type === 'heading') {
    xmlElement.setAttribute('level', node.depth);
  }

  if (node.children) {
    node.children.map((children, index) => {
      xmlElement.insert(index, [treeNodeToYjsElement(children)]);
    });
  }

  return xmlElement;
};

/**
 *
 * @param {Y.XmlFragment} xmlFragment
 * @returns {string} markdown string
 */
export const xmlFragmentToMarkdown = xmlFragment => {
  const parsed = xmlFragmentToMarkdownProcessor.processSync(xmlFragment.toString());

  return parsed.toString();
};

/**
 *
 * @param {string} mdText
 * @returns {Y.XmlFragment} xmlFragment
 */
export const injectMarkdownIntoXmlFragment = (mdText, xmlFragment) => {
  const tree = markdownToXmlFragmentProcessor.parse(mdText);

  tree.children.map((children, index) => {
    xmlFragment.insert(index, [treeNodeToYjsElement(children)]);
  });
};
