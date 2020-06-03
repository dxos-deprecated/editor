//
// Copyright 2019 Wireline, Inc.
//

import EventEmitter from 'events';
import * as Y from 'yjs';
import { uuidv4 } from 'lib0/random';

import DocumentContent from './document-content';

const VERSIONS_KEY = 'versions';
const VERSIONS_VERSIONS_KEY = 'versions.versions';
const VERSIONS_CURRENT_KEY = 'versions.current';

/**
 * @typedef {{ id: string, name: string, ?state: string }} version
 */

/**
 * DocumentVersions class for document
 */
class DocumentVersions extends EventEmitter {

  /**
   * @private
   * @type {Document}
   */
  _document = undefined;

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
   * @private
   * @type {Y.Map}
   */
  get _versionsMap() {
    return this.document.doc.getMap(VERSIONS_KEY);
  }

  /**
   * Available versions.
   * @type {Object.<string, version>}
   */
  get versions() {
    if (!this._versionsMap.has(VERSIONS_VERSIONS_KEY)) {
      this._versionsMap.set(VERSIONS_VERSIONS_KEY, {});
    }

    return this._versionsMap.get(VERSIONS_VERSIONS_KEY);
  }

  /**
   * Current version id for `documentVersions.document`.
   * @type {string}
   */
  get currentVersionId() {
    return this._versionsMap.get(VERSIONS_CURRENT_KEY);
  }

  /**
   * Current version for document.
   * @type {version}
   */
  get current() {
    return this.versions[this.currentVersionId];
  }

  /**
   * Versions count.
   * @type {number}
   */
  get count() {
    return Object.keys(this.versions).length;
  }

  /**
   * Sets current version id.
   * @param {string} currentVersionId id for current version.
   */
  set currentVersionId(currentVersionId) {
    this._versionsMap.set(VERSIONS_CURRENT_KEY, currentVersionId);
  }

  /**
   * @private
   * @param {Array<Y.Event>} events
   * @param {Y.Transaction} transaction
   */
  _versionsUpdatedListener(events, transaction) {
    this.emit('update', { events, transaction }, this);
  }

  /**
   * Initialize versions. On events.
   */
  init() {
    this._versionsMap.observeDeep(this._versionsUpdatedListener.bind(this));
  }

  /**
   * Destroy current versions. Off events.
   */
  destroy() {
    this._versionsMap.unobserveDeep(this._versionsUpdatedListener.bind(this));
  }

  /**
   * Creates and sets a new version as current. Current version will be freezed.
   * @param {string} name Name for new version.
   * @param {object} [origin={}] Origin extra data for transaction
   * @returns {version} Created and current version.
   */
  create(name, origin = {}) {
    const state = this.document.docState;

    this.document.transact(() => {
      const versions = { ...this.versions };

      const id = uuidv4();
      versions[id] = { id, name, state };
      this._versionsMap.set(VERSIONS_VERSIONS_KEY, versions);
      this.currentVersionId = id;
    }, { versions: 'create', ...origin });

    return this.current;
  }

  /**
   * Restore `#documentVersions.document` to a previous version.
   * @param {string} versionId desired id version to restore.
   * @param {object} [origin={}] Origin extra data for transaction
   * @returns {version} Restored version data.
   */
  restore(versionId, origin = {}) {
    if (!this.versions[versionId]) {
      throw new Error(`Version id ${versionId} does not exist`);
    }

    const versions = { ...this.versions };
    const version = versions[versionId];

    this.document.destroy();

    this.document.doc = new Y.Doc();

    this.document.transact(() => {
      this.document._content = new DocumentContent(this.document);

      this.document.applyUpdate(version.state);

      this._versionsMap.set(VERSIONS_VERSIONS_KEY, versions);

      this.currentVersionId = versionId;
    }, { versions: 'restore', ...origin });

    this.document.init();

    return version;
  }
}

export default DocumentVersions;