//
// Copyright 2020 DXOS.org
//

import { XmlElement, XmlFragment } from 'yjs';
import toHtml from 'hast-util-to-html';
import rehype2remark from 'rehype-remark';
import rehypeStringify from 'rehype-stringify';
import remarkStringify from 'remark-stringify';

import { htmlProcessor } from './common';

XmlElement.prototype.toString = function () {
  const attrs = this.getAttributes();

  const stringBuilder = [];
  const keys = [];

  for (const key in attrs) {
    keys.push(key);
  }

  keys.sort();

  const keysLen = keys.length;
  for (let i = 0; i < keysLen; i++) {
    const key = keys[i];
    const isObjectValue = typeof attrs[key] === 'object' && attrs[key] !== null;
    const value = isObjectValue ? encodeURI(JSON.stringify(attrs[key])) : attrs[key];
    stringBuilder.push(`${key}="${value}"`);
  }

  const nodeName = this.nodeName.toLocaleLowerCase();
  const attrsString = stringBuilder.length > 0 ? ' ' + stringBuilder.join(' ') : '';
  return `<${nodeName}${attrsString}>${XmlFragment.prototype.toString.call(this)}</${nodeName}>`;
};

/**
 *
 * @param {Node} node
 */
function modifyTagName (node, originalNode) {
  let { tagName } = originalNode;

  switch (originalNode.tagName) {
    case 'paragraph':
      tagName = 'p';
      break;

    case 'ordered_list':
      tagName = 'ol';
      break;

    case 'bullet_list':
      tagName = 'ul';
      break;

    case 'list_item':
      tagName = 'li';
      break;

    case 'heading':
      tagName = `h${originalNode.properties.level}`;
      break;

    case 'horizontal_rule':
      tagName = 'hr';
      break;

    case 'hard_break':
      tagName = 'br';
      break;

    case 'code_block':
      tagName = 'pre';
      break;

    default:
      break;
  }

  node.tagName = tagName;
}

function modifyAttributes (node, originalNode) {
  const attrsToAdd = [];
  const attrsToRemove = [];

  switch (originalNode.tagName) {
    case 'heading':
      attrsToRemove.push('level');
      break;

    case 'ordered_list':
      attrsToRemove.push('order');
      break;

    case 'image':
      attrsToAdd.push(['url', originalNode.src]);
      attrsToRemove.push('src');
      break;

    case 'code_block':
      attrsToRemove.push('lang');
      break;

    default:
      break;
  }

  attrsToAdd.forEach(([name, value]) => {
    node.properties[name] = value;
  });

  node.properties = Object.keys(node.properties || {}).reduce((props, propName) => {
    if (!attrsToRemove.includes(propName)) {
      props[propName] = node.properties[propName];
    }
    return props;
  }, {});
}

function modifyStructure (node, originalNode) {
  if (originalNode.tagName === 'code_block') {
    if (!node.children[0].value.endsWith('\n')) {
      node.children[0].value += '\n';
    }

    node.children = [
      {
        type: 'element',
        tagName: 'code',
        properties: { class: `language-${originalNode.properties.lang}` },
        children: node.children
      }
    ];
  }
}

function transform (tree) {
  const node = { ...tree };

  modifyTagName(node, tree);
  modifyAttributes(node, tree);
  modifyStructure(node, tree);

  node.children = (node.children || []).map(transform);

  return node;
}

function xmlFragmentTransform () {
  function transformer (tree) {
    return transform(tree);
  }

  return transformer;
}

function reactElement (h, node) {
  return h(node, 'html', toHtml(node));
}

export function docToMarkdown (doc) {
  const fragment = doc.getXmlFragment('content');

  const html = htmlProcessor()
    .use(xmlFragmentTransform)
    .use(rehypeStringify)
    .processSync(fragment.toString());

  const result = htmlProcessor()
    .use(rehype2remark, {
      handlers: {
        block_react_element: reactElement,
        inline_react_element: reactElement
      }
    })
    .use(remarkStringify, { listItemIndent: 1, tightDefinitions: true })
    .processSync(html);

  return result.toString();
}
