//
// Copyright 2020 Wireline, Inc.
//

const calcYchangeDomAttrs = (attrs, domAttrs = {}) => {
  domAttrs = Object.assign({}, domAttrs);
  if (attrs.ychange !== null) {
    domAttrs.ychange_user = attrs.ychange.user;
    domAttrs.ychange_state = attrs.ychange.state;
  }
  return domAttrs;
};

export const nodes = {
  doc: {
    content: 'block+'
  },

  paragraph: {
    attrs: { ychange: { default: null } },
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM(node) {
      return ['p', calcYchangeDomAttrs(node.attrs), 0];
    }
  },

  text: {
    group: 'inline'
  },

  blockquote: {
    attrs: { ychange: { default: null } },
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM(node) {
      return ['blockquote', calcYchangeDomAttrs(node.attrs), 0];
    }
  },

  horizontal_rule: {
    attrs: { ychange: { default: null } },
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM(node) {
      return ['div', ['hr', calcYchangeDomAttrs(node.attrs)]];
    }
  },

  heading: {
    attrs: {
      level: { default: 1 },
      ychange: { default: null }
    },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } }
    ],
    toDOM(node) {
      return [`h${node.attrs.level}`, calcYchangeDomAttrs(node.attrs), 0];
    }
  },

  code_block: {
    attrs: { ychange: { default: null } },
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM(node) {
      return ['pre', calcYchangeDomAttrs(node.attrs), ['code', 0]];
    }
  },

  image: {
    inline: true,
    attrs: {
      ychange: { default: null },
      src: {},
      alt: { default: null },
      title: { default: null }
    },
    group: 'inline',
    draggable: true,
    parseDOM: [
      {
        tag: 'img[src]',
        getAttrs(dom) {
          return {
            src: dom.getAttribute('src'),
            title: dom.getAttribute('title'),
            alt: dom.getAttribute('alt')
          };
        }
      }
    ],
    toDOM(node) {
      const domAttrs = {
        src: node.attrs.src,
        title: node.attrs.title,
        alt: node.attrs.alt
      };
      return ['img', calcYchangeDomAttrs(node.attrs, domAttrs)];
    }
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

  ordered_list: {
    content: 'list_item+',
    group: 'block',
    attrs: {
      ychange: { default: null },
      order: { default: 1 },
      tight: { default: false }
    },
    parseDOM: [
      {
        tag: 'ol',
        getAttrs(dom) {
          return {
            order: dom.hasAttribute('start') ? +dom.getAttribute('start') : 1,
            tight: dom.hasAttribute('data-tight')
          };
        }
      }
    ],
    toDOM(node) {
      const domAttrs = {
        start: node.attrs.order === 1 ? null : node.attrs.order,
        'data-tight': node.attrs.tight ? 'true' : null
      };

      return ['ol', calcYchangeDomAttrs(node.attrs, domAttrs), 0];
    }
  },

  bullet_list: {
    content: 'list_item+',
    group: 'block',
    attrs: {
      ychange: { default: null },
      tight: { default: false }
    },
    parseDOM: [
      {
        tag: 'ul',
        getAttrs: dom => ({ tight: dom.hasAttribute('data-tight') })
      }
    ],
    toDOM(node) {
      const domAttrs = {
        'data-tight': node.attrs.tight ? 'true' : null
      };

      return ['ul', calcYchangeDomAttrs(node.attrs, domAttrs), 0];
    }
  },

  list_item: {
    content: 'paragraph block*',
    defining: true,
    attrs: {
      ychange: { default: null }
    },
    parseDOM: [{ tag: 'li' }],
    toDOM(node) {
      return ['li', calcYchangeDomAttrs(node.attrs), 0];
    }
  },

  react_element: {
    group: 'inline',
    content: 'inline*',
    inline: true,
    atom: true,
    attrs: {
      props: { default: null }
    },
    parseDOM: [
      {
        tag: 'reactelement',
        getAttrs(dom) {
          return {
            props: JSON.parse(decodeURI(dom.getAttribute('props')))
          };
        }
      }
    ],

    toDOM: node => {
      return ['reactelement', {
        'props': encodeURI(JSON.stringify(node.attrs.props))
      }, 0];
    }
  }
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
  },

  ychange: {
    attrs: {
      user: { default: null },
      state: { default: null }
    },
    inclusive: false,
    parseDOM: [{ tag: 'ychange' }],
    toDOM(node) {
      return [
        'ychange',
        {
          ychange_user: node.attrs.user,
          ychange_state: node.attrs.state
        },
        0
      ];
    }
  }
};

export default { nodes, marks };
