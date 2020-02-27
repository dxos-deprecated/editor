//
// Copyright 2020 Wireline, Inc.
//

export const nodes = {
  doc: {
    content: 'paragraph',
  },

  paragraph: {
    content: 'inline*',
    group: 'paragraph',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
      return ['p', 0];
    }
  },

  text: {
    group: 'inline'
  },

  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM() {
      return ['br'];
    }
  },
};

export const marks = {
  em: {
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style', getAttrs: value => value === 'italic' && null }
    ],
    toDOM() {
      return ['em'];
    }
  },

  strong: {
    parseDOM: [
      { tag: 'b' },
      { tag: 'strong' },
      {
        style: 'font-weight',
        getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
      }
    ],
    toDOM() {
      return ['strong'];
    }
  },

  link: {
    attrs: {
      href: {},
      title: { default: null }
    },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs(dom) {
          return {
            href: dom.getAttribute('href'),
            title: dom.getAttribute('title')
          };
        }
      }
    ],
    toDOM(node) {
      return ['a', node.attrs];
    }
  },

  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM() {
      return ['code'];
    }
  },

  underline: {
    parseDOM: [
      { tag: 'u' },
      {
        style: 'text-decoration',
        getAttrs: value => value === 'underline'
      }
    ],
    toDOM() {
      return ['u', 0];
    }
  }
};

export default { nodes, marks };
