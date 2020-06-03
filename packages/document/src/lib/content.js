//
// Copyright 2019 Wireline, Inc.
//


import unified from 'unified';

import rehype2remark from 'rehype-remark';
import rehypeDocument from 'rehype-document';
import rehypeSortAttributes from 'rehype-sort-attributes';
import rehypeFormat from 'rehype-format';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';

import remarkBreaks from 'remark-breaks';
import remark2rehype from 'remark-rehype';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

import { listItem } from 'mdast-util-to-hast/lib/handlers';

import Document from '../document';

import remark2XmlFragment from './remark-xml-fragment';
import rehype2XmlFragment from './rehype-xml-fragment';

import { xmlFragmentTransform } from './xml-fragment-transformer';

export const markdownProcessor = (processor = unified()) => {
  return processor
    .use(remarkParse)
    .use(remarkBreaks);
};

export const htmlProcessor = (processor = unified()) => {
  return processor.use(rehypeParse, { fragment: true, emitParseErrors: true });
};

/**
 *
 * @param {Y.XmlFragment} xmlFragment input xml content
 * @returns {string} Markdown string
 */
export const toMarkdown = xmlFragment => {
  const html = htmlProcessor()
    .use(xmlFragmentTransform)
    .use(rehypeStringify)
    .processSync(xmlFragment.toString());

  const result = htmlProcessor()
    .use(rehype2remark)
    .use(remarkStringify)
    .processSync(html);

  return result.toString();
};

/**
 *
 * @param {Y.XmlFragment} xmlFragment input xml content
 * @returns {string} HTML string
 */
export const toHtml = (xmlFragment, { format = true } = {}) => {
  const processor = htmlProcessor()
    .use(xmlFragmentTransform)
    .use(rehypeDocument)
    .use(rehypeStringify);

  if (format) {
    processor.use(rehypeFormat);
  }

  const result = processor.processSync(xmlFragment.toString());

  return result.toString();
};

/**
 * @param {string} markdown input markdown content
 * @param {Document} document document that holds the content
 * @returns {Document} Document with content applied
 */
export const fromMarkdown = (markdown, document = new Document()) => {
  markdownProcessor()
    .use(remark2XmlFragment, { document })
    .processSync(markdown);

  return document;
};

/**
 * @param {string} html input html content
 * @param {Document} document document that holds the content
 * @returns {Y.XmlFragment} XmlFragment content
 */
export const fromHtml = (html, document = new Document()) => {
  const result = htmlProcessor()
    .use(rehype2XmlFragment, { document })
    .processSync(html);

  return result.contents.toString();
};

export const markdownToHtml = (markdown, { format = true, wrapInDocument = true } = {}) => {
  const processor = unified()
    .use(remarkParse)
    .use(remark2rehype, {
      commonmark: true,
      handlers: {
        listItem(h, node, parent) {
          parent.spread = true;
          return listItem(h, node, parent);
        }
      }
    })
    .use(rehypeSortAttributes);

  if (wrapInDocument) {
    processor.use(rehypeDocument);
  }

  if (format) {
    processor.use(rehypeFormat);
  }

  processor.use(rehypeStringify);

  const result = processor.processSync(markdown);

  return result.toString();
};
