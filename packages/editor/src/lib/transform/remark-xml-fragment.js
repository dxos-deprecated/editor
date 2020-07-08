//
// Copyright 2019 DXOS.org
//

import { Text, XmlElement } from 'yjs';

const tagName = node => {
  switch (node.type) {
    case 'break':
      return 'hard_break';

    case 'code':
      return 'code_block';

    case 'emphasis':
      return 'em';

    case 'inlineCode':
      return 'code';

    case 'list':
      return node.ordered ? 'ordered_list' : 'bullet_list';

    case 'thematicBreak':
      return 'horizontal_rule';

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
      xmlElement.insert(0, [new Text(node.value)]);
      break;

    case 'code':
      attrs.push(['lang', node.lang]);
      xmlElement.insert(0, [new Text(node.value)]);
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

export function remark2XmlFragment (doc) {
  const compiler = node => {
    const children = (node.children || []).map(compiler);

    if (node.type === 'root') {
      const content = doc.getXmlFragment('content');
      content.delete(0, content.length);
      content.insert(0, children);
      return content;
    }

    if (node.type === 'text') {
      return new Text(node.value);
    }

    let xmlElement = new XmlElement(tagName(node));

    xmlElement = copyDefinition(node, xmlElement);

    xmlElement.insert(0, children);

    return xmlElement;
  };

  this.Compiler = compiler;
}
