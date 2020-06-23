//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

export const xmlText = content => {
  return new Y.XmlText(content);
};

export const xmlParagraph = (textContent, content = new Y.XmlText(textContent)) => {
  const paragraph = new Y.XmlElement('paragraph');
  paragraph.insert(0, Array.isArray(content) ? content : [content]);
  return paragraph;
};

export const xmlHeading = (content, level = 1) => {
  const heading = new Y.XmlElement('heading');
  heading.setAttribute('level', level);
  heading.insert(0, [new Y.XmlText(content)]);
  return heading;
};

export const xmlBlockquote = content => {
  const blockquote = new Y.XmlElement('blockquote');
  blockquote.insert(0, [xmlParagraph(content)]);
  return blockquote;
};

export const xmlHorizontalRule = () => {
  return new Y.XmlElement('horizontal_rule');
};

export const xmlInlineCode = content => {
  const inline = new Y.XmlElement('code');
  inline.insert(0, [xmlText(content)]);
  return inline;
};

export const xmlCodeBlock = (lang, code) => {
  const codeBlock = new Y.XmlElement('code_block');
  codeBlock.setAttribute('lang', lang);
  codeBlock.insert(0, [xmlText(code)]);
  return codeBlock;
};

export const xmlImage = (src, alt, title) => {
  const image = new Y.XmlElement('image');
  image.setAttribute('src', src);
  image.setAttribute('alt', alt);
  image.setAttribute('title', title);

  return image;
};

export const xmlTextBreak = () => {
  return new Y.XmlElement('break');
};

export const xmlListItem = content => {
  const listItem = new Y.XmlElement('list_item');
  listItem.insert(0, [xmlParagraph(content)]);
  return listItem;
};

export const xmlBulletList = items => {
  const bulletList = new Y.XmlElement('bullet_list');
  bulletList.insert(0, items.map(text => xmlListItem(text)));
  return bulletList;
};

export const xmlOrderedList = items => {
  const orderedList = new Y.XmlElement('ordered_list');
  orderedList.setAttribute('order', 1);
  orderedList.insert(0, items.map(text => xmlListItem(text)));
  return orderedList;
};

export const xmlStrong = content => {
  const strong = new Y.XmlElement('strong');
  strong.insert(0, [xmlText(content)]);
  return strong;
};

export const xmlEm = content => {
  const em = new Y.XmlElement('em');
  em.insert(0, [xmlText(content)]);
  return em;
};
