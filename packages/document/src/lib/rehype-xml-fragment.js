//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

const tagName = node => {
  switch (node.tagName) {
    case 'p':
      return 'paragraph';

    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';

    case 'hr':
      return 'horizontal_rule';

    case 'ul':
      return 'bullet_list';

    case 'ol':
      return 'ordered_list';

    case 'li':
      return 'list_item';

    case 'code':
      return 'code';

    case 'pre':
      return 'code_block';

    case 'img':
      return 'image';

    case 'br':
      return 'break';

    default:
      return node.tagName;
  }
};

const copyDefinition = (node, xmlElement) => {
  const attrs = [];
  switch (node.tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      attrs.push(['level', node.tagName[1]]);
      break;

    case 'ol':
      attrs.push(['order', 1]);
      break;

    case 'code':
      xmlElement.insert(0, [new Y.Text(node.value)]);
      break;

    case 'pre':
      if (node.children[0].properties.className) {
        const classes = node.children[0].properties.className;
        const langClass = classes.find(className => className.startsWith('language-'));

        if (langClass) {
          const lang = langClass.split('-')[1];
          attrs.push(['lang', lang]);
        }
      }

      xmlElement.insert(0, [new Y.Text(node.value)]);
      break;

    case 'img':
      attrs.push(
        ['alt', node.properties.alt],
        ['title', node.properties.title],
        ['src', node.properties.src]
      );
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
function rehype2XmlFragment({ document }) {

  /**
   * @param {Node} node
   */
  const compiler = (node, parent = null) => {


    const children = (node.children || []).map(child => compiler(child, node)).filter(Boolean);

    if (node.type === 'root') {
      document.content.insert(0, children);
      return document.content.xmlFragment;
    }

    if (node.type === 'text') {
      return new Y.Text(node.value);
    }

    if (node.tagName === 'code' && parent.tagName === 'pre') {
      return new Y.Text(node.children[0].value);
    }

    let xmlElement = new Y.XmlElement(tagName(node));

    xmlElement = copyDefinition(node, xmlElement);

    if (children.length > 0) {
      xmlElement.insert(0, children);
    }

    return xmlElement;
  };

  this.Compiler = compiler;
}

export default rehype2XmlFragment;
