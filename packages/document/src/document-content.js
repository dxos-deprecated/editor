//
// Copyright 2019 Wireline, Inc.
//

import EventEmitter from 'events';
import { fromMarkdown, toMarkdown, toHtml } from './lib/content';

const CONTENT_KEY = 'content';

/** 
* @event Document#update
* @param {object} data
* @param {Array<Y.Event>} data.events list of events for this update.
* @param {Y.Transaction} data.transaction transaction for this update.
* @param {DocumentContent} documentContent DocumentContent updated.
*/

/**
 * DocumentContent class for content
 * 
 * @extends EventEmitter
 * @fires DocumentContent#update
 */
class DocumentContent extends EventEmitter {

  /**
   * @private
   * @type {Document}
   */
  _document = undefined;

  /**
   * Creates a DocumentContent for a Document instance.
   * 
   * @param {Document} document document for this content
   */
  constructor(document) {
    super();
    this._document = document;
  }

  /**
   * Document for this content.
   * @type {Document}
   */
  get document() {
    return this._document;
  }

  /**
   * Y.XmlFragment content
   * @type {Y.XmlFragment}
   */
  get xmlFragment() {
    return this.document.doc.getXmlFragment(CONTENT_KEY);
  }

  /**
   * Content length.
   * @type {number}
   */
  get length() {
    return this.xmlFragment.length;
  }

  /**
   * @private
   * @param {Array<Y.Event>} events
   * @param {Y.Transaction} transaction
   */
  _contentUpdatedListener(events, transaction) {
    this.emit('update', { events, transaction }, this);
  }

  /**
   * Initialize content. On events.
   */
  init() {
    this.xmlFragment.observeDeep(this._contentUpdatedListener.bind(this));
  }

  /**
   * Destroy current content. Off events.
   */
  destroy() {
    this.xmlFragment.unobserveDeep(this._contentUpdatedListener.bind(this));
  }

  /**
   * Compares two DocumentContent instances.
   * @param {DocumentContent} otherContent
   * @returns {boolean} same
   */
  equals(otherContent) {
    return this.xmlFragment.toString() === otherContent.xmlFragment.toString();
  }

  /**
   * Inserts new content at an index.
   *
   * @param {number} index The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   * @param {object} [origin={}] Origin extra data for transaction
   */
  insert(index, content, origin = {}) {
    this.document.doc.transact(() => {
      return this.xmlFragment.insert(index, content);
    }, { content: 'insert', ...origin });
  }

  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} [length=1] The number of elements to remove. Defaults to 1
   * @param {object} [origin={}] Origin extra data for transaction
   */
  delete(index, length = 1, origin = {}) {
    this.document.doc.transact(() => {
      return this.xmlFragment.delete(index, length);
    }, { content: 'delete', ...origin });
  }

  /**
   * Get the string representation of this content.
   *
   * @return {string} The string representation of this content.
   */
  toString() {
    return this.xmlFragment.toString();
  }

  /**
   * Set current content based on `markdown`. Current content will be replaced.
   * 
   * @param {string} markdown
   * @returns {Document} document
   */
  fromMarkdown(markdown) {
    return fromMarkdown(markdown, this.document);
  }

  /**
   * Markdown representation of this content.
   * 
   * @returns {string} Content as Markdown
   */
  toMarkdown() {
    return toMarkdown(this.toString());
  }

  /**
   * HTML representation of this content.
   * 
   * @returns {string} Content as HTML
   */
  toHtml() {
    return toHtml(this.toString());
  }
}

export default DocumentContent;