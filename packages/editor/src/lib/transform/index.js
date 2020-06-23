//
// Copyright 2020 Wireline, Inc.
//

import { Doc } from 'yjs';
import unified from 'unified';

import rehype2remark from 'rehype-remark';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import remarkBreaks from 'remark-breaks';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remark2react from 'remark-react';

import { xmlFragmentTransform } from './xml-fragment-transformer';
import { remark2XmlFragment } from './remark-xml-fragment';

const markdownProcessor = (processor = unified()) => {
  return processor
    .use(remarkParse)
    .use(remarkBreaks);
};

const htmlProcessor = (processor = unified()) => {
  return processor.use(rehypeParse, { fragment: true });
};

export const markdownToDoc = (markdown, doc = new Doc()) => {
  markdownProcessor()
    .use(remark2XmlFragment, doc)
    .processSync(markdown);

  return doc;
};

export const xmlElementToMarkdown = xmlElement => {
  const html = htmlProcessor()
    .use(xmlFragmentTransform)
    .use(rehypeStringify)
    .processSync(xmlElement.toString());

  const result = htmlProcessor()
    .use(rehype2remark)
    .use(remarkStringify, { listItemIndent: 1, tightDefinitions: true })
    .processSync(html);

  return result.toString();
};

export const markdownToReact = markdownString => {
  const reactElement = markdownProcessor()
    .use(remark2react)
    .processSync(markdownString)
    .result;

  return reactElement;
};
