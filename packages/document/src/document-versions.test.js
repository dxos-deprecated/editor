//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

import { Document } from '.';

const insertParagraph = (document, position = document.content.length, text = 'test') => {
  const paragraph = new Y.XmlElement('paragraph');
  paragraph.insert(0, [new Y.XmlText(text)]);
  document.content.insert(position, [paragraph]);
};

const stringParagraphs = (...str) => str.map(str => `<paragraph>${str}</paragraph>`).join('');

const makeVersionFlow = (document, restore = false) => {
  insertParagraph(document, null, 'Testing first text insertion');

  document.versions.create('First version');

  const firstVersionId = document.versions.currentVersionId;

  document.versions.create('Second version');

  insertParagraph(document, null, 'Second text insertion');

  expect(document.content.toString()).toBe(stringParagraphs('Testing first text insertion', 'Second text insertion'));

  if (restore) {
    document.versions.restore(firstVersionId);
    expect(document.content.toString()).toBe(stringParagraphs('Testing first text insertion'));
  }

  return {
    document,
    previousVersionId: firstVersionId
  };
};

/**
 * @type {Document}
 */
let document;
let docUpdateEventMockVersions;

beforeEach(() => {
  document = new Document();
  docUpdateEventMockVersions = jest.fn();
  document.on('update', docUpdateEventMockVersions);
});

afterEach(() => {
  document.destroy();
  document = undefined;
  docUpdateEventMockVersions = undefined;
});

describe('Versions', () => {
  test('Initial', () => {
    expect(document.versions.current).not.toBeDefined();
    expect(document.versions.count).toBe(0);
  });

  test('Create version', () => {
    const previousVersionState = document.docState;
    document.versions.create('First version');

    expect(document.versions.current instanceof Object).toBeTruthy();
    expect(document.versions.current.name).toBe('First version');
    expect(document.versions.current.state).toEqual(previousVersionState);
    expect(document.versions.count).toBe(1);
  });

  test('Content', () => {
    makeVersionFlow(document);
  });

  test('Restore', () => {
    makeVersionFlow(document, true);
  });

  test('Listeners after restore', () => {
    expect(docUpdateEventMockVersions.mock.calls.length).toBe(0);

    makeVersionFlow(document, true);

    expect(docUpdateEventMockVersions.mock.calls.length).toBe(4);

    insertParagraph(document);

    expect(docUpdateEventMockVersions.mock.calls.length).toBe(5);

    const [firstParam, secondParam] = docUpdateEventMockVersions.mock.calls[docUpdateEventMockVersions.mock.calls.length - 1];
    expect(firstParam).toHaveProperty('update');
    expect(firstParam).toHaveProperty('origin');
    expect(secondParam instanceof Document).toBeTruthy();
  });
});

