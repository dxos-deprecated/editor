//
// Copyright 2020 DXOS.org
//

import { XmlText, XmlElement } from 'yjs';

export function xmlText (content) {
  return new XmlText(content);
}

export function xmlParagraph (textContent, content = new XmlText(textContent)) {
  const paragraph = new XmlElement('paragraph');
  paragraph.insert(0, Array.isArray(content) ? content : [content]);
  return paragraph;
}

export function xmlHeading (content, level = 1) {
  const heading = new XmlElement('heading');
  heading.setAttribute('level', level);
  heading.insert(0, [new XmlText(content)]);
  return heading;
}

export function xmlBlockquote (content) {
  const blockquote = new XmlElement('blockquote');
  blockquote.insert(0, [xmlParagraph(content)]);
  return blockquote;
}

export function xmlHorizontalRule () {
  return new XmlElement('horizontal_rule');
}

export function xmlInlineCode (content) {
  const inline = new XmlElement('code');
  inline.insert(0, [xmlText(content)]);
  return inline;
}

export function xmlCodeBlock (lang, code) {
  const codeBlock = new XmlElement('code_block');
  codeBlock.setAttribute('lang', lang);
  codeBlock.insert(0, [xmlText(code)]);
  return codeBlock;
}

export function xmlImage (src, alt, title) {
  const image = new XmlElement('image');
  image.setAttribute('src', src);
  image.setAttribute('alt', alt);
  image.setAttribute('title', title);

  return image;
}

export function xmlTextBreak () {
  return new XmlElement('break');
}

export function xmlListItem (content) {
  const listItem = new XmlElement('list_item');
  listItem.insert(0, [xmlParagraph(content)]);
  return listItem;
}

export function xmlBulletList (items) {
  const bulletList = new XmlElement('bullet_list');
  bulletList.insert(0, items.map(text => xmlListItem(text)));
  return bulletList;
}

export function xmlOrderedList (items) {
  const orderedList = new XmlElement('ordered_list');
  orderedList.setAttribute('order', 1);
  orderedList.insert(0, items.map(text => xmlListItem(text)));
  return orderedList;
}

export function xmlStrong (content) {
  const strong = new XmlElement('strong');
  strong.insert(0, [xmlText(content)]);
  return strong;
}

export function xmlEm (content) {
  const em = new XmlElement('em');
  em.insert(0, [xmlText(content)]);
  return em;
}
