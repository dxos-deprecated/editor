//
// Copyright 2020 DXOS.org
//

export const underlineMark = {
  parseDOM: [
    { tag: 'u' },
    {
      style: 'text-decoration',
      getAttrs: value => value === 'underline'
    }
  ],
  toDOM () {
    return ['u', 0];
  }
};

const reactElementNode = (type = 'block') => ({
  selectable: true,
  attrs: {
    props: { default: null },
    className: { default: '' }
  },

  // Serialization: from DOM
  parseDOM: [
    {
      tag: `${type}reactelement`,
      getAttrs (dom) {
        return {
          props: JSON.parse(decodeURI(dom.getAttribute('props'))),
          className: dom.getAttribute('class')
        };
      }
    }
  ],

  // Serialization: to DOM
  toDOM: node => {
    return [`${type}reactelement`, {
      props: encodeURI(JSON.stringify(node.attrs.props)),
      class: node.attrs.className
    }];
  }
});

export const blockReactElementNode = {
  ...reactElementNode(),
  group: 'block',
  atom: 'true'
};

export const inlineReactElementNode = {
  ...reactElementNode('inline'),
  group: 'inline',
  inline: true
};
