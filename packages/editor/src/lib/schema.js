//
// Copyright 2019 Wireline, Inc.
//

import { Schema } from 'prosemirror-model';

const calcYchangeDomAttrs = (attrs, domAttrs = {}) => {
  domAttrs = Object.assign({}, domAttrs);
  if (attrs.ychange !== null) {
    domAttrs.ychange_user = attrs.ychange.user;
    domAttrs.ychange_state = attrs.ychange.state;
  }
  return domAttrs;
};

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
export const nodes = {
  // :: NodeSpec The top level document node.
  doc: {
    content: 'block+'
  },

  reactelement: {
    group: 'inline',
    content: 'inline*',
    inline: true,
    // This makes the view treat the node as a leaf, even though it
    // technically has content
    atom: true,
    parseDOM: [{ tag: 'reactelement' }],
    toDOM: node => {
      return ['reactelement', calcYchangeDomAttrs(node.attrs), 0];
    }
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  paragraph: {
    attrs: { ychange: { default: null } },
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM(node) {
      return ['p', calcYchangeDomAttrs(node.attrs), 0];
    }
  },

  // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
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

  // :: NodeSpec A horizontal rule (`<hr>`).
  horizontal_rule: {
    attrs: { ychange: { default: null } },
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM(node) {
      return ['div', ['hr', calcYchangeDomAttrs(node.attrs)]];
    }
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
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

  // :: NodeSpec A code listing. Disallows marks or non-text inline
  // nodes by default. Represented as a `<pre>` element with a
  // `<code>` element inside of it.
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

  // :: NodeSpec The text node.
  text: {
    group: 'inline'
  },

  // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
  // `alt`, and `href` attributes. The latter two default to the empty
  // string.
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

  // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
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
        start: node.attrs.order == 1 ? null : node.attrs.order,
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
  }
};

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
export const marks = {
  // :: MarkSpec A link. Has `href` and `title` attributes. `title`
  // defaults to the empty string. Rendered and parsed as an `<a>`
  // element.
  em: {
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style', getAttrs: value => value == 'italic' && null }
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
        { ychange_user: node.attrs.user, ychange_state: node.attrs.state },
        0
      ];
    }
  }
};

export const schema = new Schema({ nodes, marks });
