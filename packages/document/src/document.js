//
// Copyright 2019 Wireline, Inc.
//

import EventEmitter from 'events';

import { Doc, encodeStateAsUpdate, applyUpdate, encodeStateVector } from 'yjs';

import { createEncoder, writeAny, toUint8Array } from 'lib0/decoding';
import { createDecoder, readAny } from 'lib0/encoding';
import { uuidv4 } from 'lib0/random';

import DocumentContent from './document-content';
import DocumentVersions from './document-versions';

/** 
* @event Document#update
* @param {object} data
* @param {Uint8Array} data.update Update applied.
* @param {any} data.origin Origin for this update.
* @param {Document} document Document updated.
*/

/**
 *
 * @class Document
 * @extends {EventEmitter}
 * @fires Document#update
 */
class Document extends EventEmitter {
  /**
   * 
   * Encode a Document instance.
   * 
   * @static
   * @param {Document} document
   * @return {Uint8Array} encoded document
   */
  static encode(document) {
    const encoder = createEncoder();

    writeAny(encoder, {
      id: document.id,
      doc: document.docState
    });

    return toUint8Array(encoder);
  }

  /**
   * 
   * Decodes an encoded Document instance.
   * 
   * @param {Uint8Array} encodedDocument
   * @return {Document} document
   */
  static decode(encodedDocument) {
    const decoder = createDecoder(encodedDocument);

    const { id, doc } = readAny(decoder);

    const document = new Document();

    document._id = id;
    document.applyUpdate(doc);

    return document;
  }

  /**
   * @private
   * @type {string}
   */
  _id = undefined;

  /**
   * @private
   * @type {Y.Doc}
   */
  _doc = undefined;

  /**
   * @private
   * @type {DocumentContent}
   */
  _content = undefined;

  /**
   * @private
   * @type {DocumentVersions}
   */
  _versions = undefined;


  /**
   * Creates a new Document.
   * 
   * @param {string} id document id
   * @param {Y.Doc} doc document doc instance
   */
  constructor(id = uuidv4(), doc = new Doc()) {
    super();

    this._id = id;
    this._doc = doc;
    this._content = new DocumentContent(this);
    this._versions = new DocumentVersions(this);

    this.init();
  }

  /**
   * Document id.
   * @type {string}
   */
  get id() {
    return this._id;
  }

  /**
   * YJS Doc instance.
   * @type {Y.Doc}
   */
  get doc() {
    return this._doc;
  }

  /**
   * Content representation.
   * @type {DocumentContent}
   */
  get content() {
    return this._content;
  }

  /**
   * Versions for this document.
   * @type {DocumentVersions}
   */
  get versions() {
    return this._versions;
  }

  /**
   * `document.doc` encoded as YJS update.
   * @type {Uint8Array}
   */
  get docState() {
    return encodeStateAsUpdate(this.doc);
  }

  /**
   * Sets YJS document
   * @param {Y.Doc} doc YJS document
   */
  set doc(doc) {
    this._doc = doc;
  }

  /**
   * @private
   */
  _docUpdatedListener(update, origin) {
    this.emit('update', { update, origin }, this);
  }

  /**
   * Initialize current doc. On events.
   */
  init() {
    this.content.init();
    this.versions.init();

    this.doc.on('update', this._docUpdatedListener.bind(this));
  }

  /**
   * Destroy current doc. Off events.
   */
  destroy() {
    this.doc.off('update', this._docUpdatedListener.bind(this));

    this.content.destroy();
    this.versions.destroy();
  }

  /**
   * Clone this document and return a new one.
   * @returns {Document}
   */
  clone() {
    const document = Document.decode(Document.encode(this));
    document._id = uuidv4();
    return document;
  }

  /**
   * @param {Uint8Array} update
   * @param {any} origin
   */
  applyUpdate(update, origin) {
    applyUpdate(this.doc, update, origin);
  }

  /**
   * Computes differences between doc states and return diff as update.
   * 
   * @param {Document} otherDoc Document to compare.
   * @returns {Uint8Array} diff update.
   */
  updateDiff(otherDoc) {
    return encodeStateAsUpdate(this.doc, encodeStateVector(otherDoc.doc));
  }

  /**
   * @param {Document} otherDocument
   */
  equals(otherDocument) {
    return this.content.equals(otherDocument.content);
  }

  /**
   * Creates a transaction in wich the function `fn` will be executed
   * 
   * @param {function} fn Function to execute in a transaction
   * @param {any} origin Origin for this transaction
   */
  transact(fn, origin) {
    this.doc.transact(fn, origin);
  }
}

export default Document;