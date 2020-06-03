//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

const tagName = node => {
  switch (node.type) {
    case 'thematicBreak':
      return 'horizontal_rule';

    case 'list':
      return node.ordered ? 'ordered_list' : 'bullet_list';

    case 'inlineCode':
      return 'code';

    case 'code':
      return 'code_block';

    case 'emphasis':
      return 'em';

    default:
      // Snake case
      return node.type.replace(/(?:^|\.?)([A-Z])/g, (x, y) => `_${y.toLowerCase()}`).replace(/^_/, '');
  }
};

const copyDefinition = (node, xmlElement) => {
  const attrs = [];
  switch (node.type) {
    case 'heading':
      attrs.push(['level', node.depth]);
      break;

    case 'list':
      if (node.ordered) {
        attrs.push(['order', node.start]);
      }
      break;

    case 'inlineCode':
      xmlElement.insert(0, [new Y.Text(node.value)]);
      break;

    case 'code':
      attrs.push(['lang', node.lang]);
      xmlElement.insert(0, [new Y.Text(node.value)]);
      break;

    case 'image':
      attrs.push(['alt', node.alt], ['title', node.title], ['src', node.url]);
      break;

    default:
      break;
  }

  attrs.forEach(([name, value]) => xmlElement.setAttribute(name, value));

  return xmlElement;
};

/**
 * @param {Object} options
 * @param {Document} options.document
 */
function remark2XmlFragment({ document }) {

  /**
   * @param {Node} node
   */
  const compiler = node => {
    const children = (node.children || []).map(compiler);

    if (node.type === 'root') {
      document.content.delete(0, document.content.length);
      document.content.insert(0, children);
      return document.content.xmlFragment;
    }

    if (node.type === 'text') {
      return new Y.Text(node.value);
    }

    let xmlElement = new Y.XmlElement(tagName(node));

    xmlElement = copyDefinition(node, xmlElement);

    xmlElement.insert(0, children);

    return xmlElement;
  };

  this.Compiler = compiler;
}

export default remark2XmlFragment;
