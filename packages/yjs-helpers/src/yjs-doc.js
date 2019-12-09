//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs'; // eslint-disable-line no-unused-vars
import { Schema } from 'prosemirror-model'; // eslint-disable-line no-unused-vars
import { createNodeFromYElement } from 'y-prosemirror';
import { defaultMarkdownSerializer as mdSerializer } from 'prosemirror-markdown';

import { injectMarkdownIntoXmlFragment } from './unified-yjs';

const OLD_TEXT_CONTENT_KEY = 'content';
const CONTENT_KEY = 'xmlfragment_content_v1';

/**
 *
 * @param {Y.Doc} doc
 * @returns {Y.XmlFragment} XmlFragment content
 */
export const getXmlFragmentContent = doc => doc.getXmlFragment(CONTENT_KEY);

/**
 *
 * @param {Y.Doc} doc
 * @returns {Y.Text} Text content
 */
export const getTextContent = doc => doc.getText(OLD_TEXT_CONTENT_KEY);

/**
 *
 * @param {Y.Doc} doc
 * @param {Schema} schema
 * @returns {String} markdown content
 */
export const getContentAsMarkdown = (doc, schema) => {
  const nodes = getXmlFragmentContent(doc)
    .toArray()
    .map(node => createNodeFromYElement(node, schema, new Map()));

  if (nodes.length === 0) return '';

  // Using prosemirror-markdown schema
  const pmDoc = schema.node('doc', null, nodes);

  mdSerializer.marks.underline = {
    open: '<u>',
    close: '</u>',
    mixable: true,
    expelEnclosingWhitespace: true
  };

  Object.keys(schema.nodes).map(nodeName => {
    if (!mdSerializer.nodes[nodeName]) {
      mdSerializer.nodes[nodeName] = schema.nodes[nodeName].spec.toMarkdown;
    }
  });

  return mdSerializer.serialize(pmDoc);
};

/**
 *
 * @param {Y.Doc} doc
 * @param {function} callback
 */
export const registerContentObserver = (doc, callback) => {
  getXmlFragmentContent(doc).observeDeep(callback);
};

/**
 *
 * @param {Y.Doc} doc
 * @param {function} callback
 */
export const unregisterContentObserver = (doc, callback) => {
  getXmlFragmentContent(doc).unobserveDeep(callback);
};

/**
 *
 * @param {Y.Doc} doc
 */
export const upgradeDocContent = doc => {
  const oldTextContent = getTextContent(doc);

  // Not an older doc version
  if (oldTextContent.length === 0) return doc;

  const xmlFragment = getXmlFragmentContent(doc);

  injectMarkdownIntoXmlFragment(oldTextContent.toString(), xmlFragment);

  // Remove old content
  oldTextContent.delete(0, oldTextContent.length);

  return doc;
};
