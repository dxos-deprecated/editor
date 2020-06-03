//
// Copyright 2019 Wireline, Inc.
//

import path from 'path';

import vfile from 'to-vfile';
import remarkStringify from 'remark-stringify';

import Document from '../document';

import { toMarkdown, toHtml, fromMarkdown, markdownProcessor, markdownToHtml } from './content';
import { paragraph, heading, blockquote, horizontalRule, inlineCode, codeBlock, image, text, bulletList, orderedList, strong, em, textBreak } from './xml-fragment';

const markdown = markdownProcessor().use(remarkStringify).processSync(vfile.readSync(path.join(__dirname, './content.test.md'))).contents.toString();

/**
 * @type {Document}
 */
let document;


beforeEach(() => {
  document = new Document();
  insertContent();
});

afterEach(() => {
  document.destroy();
  document = undefined;
});

const insertContent = () => {
  [
    paragraph('Paragraph'),
    paragraph(null, [strong('bold text'), text(' and '), em('italic text')]),
    heading('Heading'),
    heading('Heading 2', 2),
    heading('Heading 3', 3),
    heading('Heading 4', 4),
    heading('Heading 5', 5),
    heading('Heading 6', 6),
    blockquote('Blockquote'),
    horizontalRule(),
    paragraph(null, inlineCode('const a = \'testing\';')),
    codeBlock('javascript', 'const a = \'This should be a code block\';'),
    paragraph(null, image('source', 'alt', 'title')),
    paragraph(null, [text('text'), textBreak(), text('with a break')]),
    bulletList(['First', 'Second']),
    orderedList(['First', 'Second']),
  ].forEach(block => document.content.insert(document.content.length, [block]));
};

test('To Markdown', () => {
  const transformedMD = toMarkdown(document.content.xmlFragment);
  expect(transformedMD).toBe(markdown);
});

test('From Markdown', () => {
  const documentFromMD = fromMarkdown(markdown);
  expect(documentFromMD.content.toString()).toBe(document.content.toString());
});

test('To HTML', () => {
  const transformedHTML = toHtml(document.content);
  const expectedHTML = markdownToHtml(markdown, { format: true });

  expect(transformedHTML).toBe(expectedHTML);
});

test.skip('From HTML', () => {
  // const html = markdownToHtml(markdown, { format: true, wrapInDocument: false });

  // const xmlContent = fromHtml(html);

  // const expected = htmlProcessor().use(rehypeStringify).processSync(xmlContent.toString()).contents.toString();
  // const original = htmlProcessor().use(rehypeStringify).processSync(document.content.toString()).contents.toString();

  // expect(xmlContent).toBe(document.content);
});

