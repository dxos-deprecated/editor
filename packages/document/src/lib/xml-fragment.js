//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

export const text = content => {
  return new Y.XmlText(content);
};

export const paragraph = (textContent, content = new Y.XmlText(textContent)) => {
  const paragraph = new Y.XmlElement('paragraph');
  paragraph.insert(0, Array.isArray(content) ? content : [content]);
  return paragraph;
};

export const heading = (content, level = 1) => {
  const heading = new Y.XmlElement('heading');
  heading.setAttribute('level', level);
  heading.insert(0, [new Y.XmlText(content)]);
  return heading;
};

export const blockquote = content => {
  const blockquote = new Y.XmlElement('blockquote');
  blockquote.insert(0, [paragraph(content)]);
  return blockquote;
};

export const horizontalRule = () => {
  return new Y.XmlElement('horizontal_rule');
};

export const inlineCode = content => {
  const inline = new Y.XmlElement('code');
  inline.insert(0, [text(content)]);
  return inline;
};

export const codeBlock = (lang, code) => {
  const codeBlock = new Y.XmlElement('code_block');
  codeBlock.setAttribute('lang', lang);
  codeBlock.insert(0, [text(code)]);
  return codeBlock;
};

export const image = (src, alt, title) => {
  const image = new Y.XmlElement('image');
  image.setAttribute('src', src);
  image.setAttribute('alt', alt);
  image.setAttribute('title', title);

  return image;
};

export const textBreak = () => {
  return new Y.XmlElement('break');
};

export const listItem = content => {
  const listItem = new Y.XmlElement('list_item');
  listItem.insert(0, [paragraph(content)]);
  return listItem;
};

export const bulletList = items => {
  const bulletList = new Y.XmlElement('bullet_list');
  bulletList.insert(0, items.map(text => listItem(text)));
  return bulletList;
};

export const orderedList = items => {
  const orderedList = new Y.XmlElement('ordered_list');
  orderedList.setAttribute('order', 1);
  orderedList.insert(0, items.map(text => listItem(text)));
  return orderedList;
};

export const strong = content => {
  const strong = new Y.XmlElement('strong');
  strong.insert(0, [text(content)]);
  return strong;
};

export const em = content => {
  const em = new Y.XmlElement('em');
  em.insert(0, [text(content)]);
  return em;
};
