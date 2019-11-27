//
// Copyright 2019 Wireline, Inc.
//

// eslint-disable-next-line no-unused-vars
import * as Y from 'yjs';
import { xmlFragmentToMarkdown, injectMarkdownIntoXmlFragment } from './unified-yjs';

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
 * @returns {String} markdown content
 */
export const getContentAsMarkdown = doc => {
  return xmlFragmentToMarkdown(getXmlFragmentContent(doc));
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
