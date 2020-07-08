//
// Copyright 2019 DXOS.org
//

/**
 *
 * @param {Node} node
 */
const modifyTagName = (node, originalNode) => {
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
};

const modifyAttributes = (node, originalNode) => {
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
};

const modifyStructure = (node, originalNode) => {
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
};

function transform (tree) {
  const node = { ...tree };

  modifyTagName(node, tree);
  modifyAttributes(node, tree);
  modifyStructure(node, tree);

  node.children = (node.children || []).map(transform);

  return node;
}

export function xmlFragmentTransform () {
  function transformer (tree) {
    return transform(tree);
  }

  return transformer;
}
