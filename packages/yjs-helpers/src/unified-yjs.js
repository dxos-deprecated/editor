//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

import rehype2remark from 'rehype-remark';
import rehypeParse from 'rehype-parse';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import unified from 'unified';

const xmlFragmentElementsNames = {
  paragraph: { tag: () => 'p' },
  heading: {
    tag: element => `h${element.properties.level}`,
    attrsToRemove: ['level']
  },
  underline: { tag: () => 'u' },
  horizontal_rule: { tag: () => 'hr' },
  code_block: { tag: () => 'pre' },
  hard_break: { tag: () => 'br' },
  list_item: { tag: () => 'li' },
  ordered_list: { tag: () => 'ol' },
  bullet_list: { tag: () => 'ul' }
};

function xmlFragmentToMarkdownTreeTransformer() {
  return transformer;

  function transformTagName(element) {
    if (element.type === 'text') return element;

    element.children = element.children.map(transformTagName);

    if (Object.keys(xmlFragmentElementsNames).includes(element.tagName)) {
      const tagReplacement = xmlFragmentElementsNames[element.tagName];

      element.tagName = tagReplacement.tag(element);

      if (tagReplacement.attrsToRemove) {
        tagReplacement.attrsToRemove.forEach(
          attr => delete element.properties[attr]
        );
      }
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

const treeNodeTypes = {
  blockquote: {},
  break: {},
  code: {
    tag: () => 'code_block'
  },
  emphasis: {
    tag: () => 'emphasis'
  },
  footnote: {},
  footnoteDefinition: {},
  footnoteReference: {},
  heading: {
    setAttributes: node => [['level', node.depth]]
  },
  html: {},
  image: {},
  imageReference: {},
  inlineCode: {},
  link: {},
  linkReference: {},
  list: {
    tag: node => node.ordered ? 'ordered_list' : 'bullet_list'
  },
  listItem: {
    tag: () => 'list_item'
  },
  paragraph: {},
  root: {},
  strong: {},
  table: {},
  text: {},
  thematicBreak: {},
  toml: {},
  yaml: {},
};

const treeNodeToYjsElement = (node) => {
  if (node.type === 'text') {
    return new Y.Text(node.value);
  }

  const treeNodeType = treeNodeTypes[node.type];

  const tagName = treeNodeType.tag ? treeNodeType.tag(node) : node.type;

  const xmlElement = new Y.XmlElement(tagName);

  if (treeNodeType.setAttributes) {
    treeNodeType.setAttributes(node).forEach(([key, value]) => {
      xmlElement.setAttribute(key, value);
    });
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
