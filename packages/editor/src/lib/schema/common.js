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

export const reactElementNode = {
  group: 'inline',
  inline: true,
  selectable: true,
  attrs: {
    props: { default: null },
    className: { default: '' },
    inline: { default: false },
    style: { default: null }
  },
  parseDOM: [
    {
      tag: 'reactelement',
      getAttrs (dom) {
        return {
          id: dom.getAttribute('id'),
          props: JSON.parse(decodeURI(dom.getAttribute('props'))),
          className: dom.getAttribute('class'),
          inline: dom.getAttribute('inline')
        };
      }
    }
  ],

  toDOM: node => {
    return ['reactelement', {
      id: node.attrs.id,
      props: encodeURI(JSON.stringify(node.attrs.props)),
      class: node.attrs.className,
      inline: node.attrs.inline,
      style: `display: ${node.attrs.inline ? 'inline-block' : 'block'};`
    }];
  }
};
