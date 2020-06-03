//
// Copyright 2019 Wireline, Inc.
//

import * as Y from 'yjs';

import { Document, DocumentContent } from '.';

const insertParagraph = (document, position = document.content.length, text = 'test') => {
  const paragraph = new Y.XmlElement('paragraph');
  paragraph.insert(0, [new Y.XmlText(text)]);
  document.content.insert(position, [paragraph]);
};

const removeParagraph = (document, position = document.content.length - 1) => {
  document.content.delete(position);
};

const stringParagraphs = (...str) => str.map(str => `<paragraph>${str}</paragraph>`).join('');

/**
 * @type {Document}
 */
let document;
let contentUpdateEventMock;

beforeEach(() => {
  document = new Document();
  contentUpdateEventMock = jest.fn();
  document.content.on('update', contentUpdateEventMock);
});

afterEach(() => {
  document.destroy();
  document = undefined;
  contentUpdateEventMock = undefined;
});

describe('Content', () => {
  test('Insertion', () => {

    insertParagraph(document);
    expect(document.content.toString()).toEqual(stringParagraphs('test'));

    insertParagraph(document, null, 'second-paragraph');
    expect(document.content.toString()).toEqual(stringParagraphs('test', 'second-paragraph'));

    insertParagraph(document, 0, 'new-first-paragraph');
    expect(document.content.toString()).toEqual(stringParagraphs('new-first-paragraph', 'test', 'second-paragraph'));
  });

  test('Deletion', () => {

    insertParagraph(document);
    removeParagraph(document, 0);
    expect(document.content.toString()).toEqual('');

    insertParagraph(document, null, 'first-paragraph');
    insertParagraph(document, null, 'second-paragraph');
    removeParagraph(document, 0);

    expect(document.content.toString()).toEqual(stringParagraphs('second-paragraph'));
  });
});

describe('Events', () => {
  test('Content update', () => {
    insertParagraph(document);
    expect(contentUpdateEventMock.mock.calls.length).toBe(1);

    const [firstParam, secondParam] = contentUpdateEventMock.mock.calls[0];
    expect(firstParam).toHaveProperty('events');
    expect(Array.isArray(firstParam.events)).toBeTruthy();
    expect(firstParam.events.length).toBe(1);
    expect(firstParam.events[0] instanceof Y.YXmlEvent).toBeTruthy();

    expect(firstParam).toHaveProperty('transaction');
    expect(firstParam.transaction instanceof Y.Transaction).toBeTruthy();

    expect(secondParam instanceof DocumentContent).toBeTruthy();
    expect(secondParam.equals(document.content)).toBeTruthy();

    removeParagraph(document);
    expect(contentUpdateEventMock.mock.calls.length).toBe(2);
  });

  test('Content update off', () => {
    document.content.off('update', contentUpdateEventMock);

    insertParagraph(document);
    expect(contentUpdateEventMock).not.toHaveBeenCalled();
  });
});

describe('Updating', () => {
  test('Content', async () => {
    const otherDocument = new Document();

    await new Promise(resolve => {
      let updates = 0;
      otherDocument.on('update', ({ update, origin }) => {
        updates++;
        document.applyUpdate(update, origin);
        if (updates === 2) {
          resolve();
        }
      });

      for (let index = 0; index < 10; index++) {
        insertParagraph(otherDocument, index, index);
      }

      for (let index = 0; index < 10; index++) {
        removeParagraph(otherDocument);
      }

      expect(document.content.toString()).toBe(otherDocument.content.toString());
    });
  });
});
