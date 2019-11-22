//
// Copyright 2019 Wireline, Inc.
//

// eslint-disable-next-line no-unused-vars
import * as Y from 'yjs';
import xmlFragmentToMarkdown from './unified-yjs-md';

export const CONTENT_KEY = 'xmlfragment_content_v1';

/**
 *
 * @param {Y.Doc} doc
 * @returns {Y.XmlFragment} XmlFragment content
 */
export const getXmlFragmentContent = doc => doc.getXmlFragment(CONTENT_KEY);

/**
 *
 * @param {Y.Doc} doc
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

window.getContentAsMarkdown = getContentAsMarkdown;
window.getXmlFragmentContent = getXmlFragmentContent;
