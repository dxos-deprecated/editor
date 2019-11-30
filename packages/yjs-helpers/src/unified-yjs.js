//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

import remarkParse from 'remark-parse';
import unified from 'unified';

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
  link: {
    tag: () => 'a',
    setAttributes: node => [['href', node]]
  },
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
 * @param {string} mdText
 * @returns {Y.XmlFragment} xmlFragment
 */
export const injectMarkdownIntoXmlFragment = (mdText, xmlFragment) => {
  const tree = markdownToXmlFragmentProcessor.parse(mdText);

  tree.children.map((children, index) => {
    xmlFragment.insert(index, [treeNodeToYjsElement(children)]);
  });
};
