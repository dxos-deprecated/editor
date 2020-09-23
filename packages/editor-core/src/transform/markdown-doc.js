//
// Copyright 2020 DXOS.org
//

import { XmlText, XmlElement, Doc } from 'yjs';
import rehypeParse from 'rehype-parse';
import unified from 'unified';

import { markdownProcessor } from './common';

function tagName (node) {
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

    case 'block_react_element':
    case 'inline_react_element':
      return node.type;

    default:
      // Snake case
      return node.type.replace(/(?:^|\.?)([A-Z])/g, (x, y) => `_${y.toLowerCase()}`).replace(/^_/, '');
  }
}

function copyDefinition (node, xmlElement) {
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
      xmlElement.insert(0, [new XmlText(node.value)]);
      break;

    case 'code':
      attrs.push(['lang', node.lang]);
      xmlElement.insert(0, [new XmlText(node.value)]);
      break;

    case 'image':
      attrs.push(['alt', node.alt], ['title', node.title], ['src', node.url]);
      break;

    case 'block_react_element':
    case 'inline_react_element':
      attrs.push(['props', JSON.parse(decodeURI(node.properties.props))], ['className', node.properties.className]);
      break;

    default:
      break;
  }

  attrs.forEach(([name, value]) => xmlElement.setAttribute(name, value));

  return xmlElement;
}

function remark2XmlFragment (doc) {
  const compiler = node => {
    const children = (node.children || []).map(compiler);

    if (node.type === 'root') {
      const content = doc.getXmlFragment('content');
      content.delete(0, content.length);
      content.insert(0, children);
      return content;
    }

    if (node.type === 'text') {
      return new XmlText(node.value);
    }

    if (node.type === 'html') {
      const hast = unified()
        .use(rehypeParse, { fragment: true })
        .parse(node.value);

      const childNode = hast.children[0];
      childNode.type = childNode.tagName;

      return compiler(childNode);
    }

    let xmlElement = new XmlElement(tagName(node));

    xmlElement = copyDefinition(node, xmlElement);

    xmlElement.insert(0, children);

    return xmlElement;
  };

  this.Compiler = compiler;
}

export function markdownToDoc (markdown, doc = new Doc()) {
  markdownProcessor()
    .use(remark2XmlFragment, doc)
    .processSync(markdown);

  return doc;
}
