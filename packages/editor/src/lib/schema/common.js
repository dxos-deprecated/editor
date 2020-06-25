//
// Copyright 2020 Wireline, Inc.
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

export const fontSizeMark = {
  attrs: {
    fontSize: { default: '1em' }
  },
  parseDOM: [{
    style: 'font-size',
    getAttrs: value => value.indexOf('em') !== -1 ? { fontSize: value } : ''
  }],
  toDOM: mark => ['span', { style: `font-size: ${mark.attrs.fontSize}px` }, 0]
};
