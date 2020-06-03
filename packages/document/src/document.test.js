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

const removeParagraph = (document, position = document.content.length - 1) => {
  document.content.delete(position);
};

const randomBetween = (min, max) => Math.floor(Math.random() * max) + min;

const filterDocument = docClientID => ({ document }) => document.doc.clientID !== docClientID;

/**
 * @type {Document}
 */
let document;
let docUpdateEventMock;

beforeEach(() => {
  document = new Document();
  docUpdateEventMock = jest.fn();
  document.on('update', docUpdateEventMock);
});

afterEach(() => {
  document.destroy();
  document = undefined;
  docUpdateEventMock = undefined;
});

describe('Creation', () => {
  test('Initial state', () => {
    expect(document.equals(new Document())).toBeTruthy();
  });
});

describe('Encoding', () => {
  test('Encoding', () => {
    let encodedDoc = Document.encode(document);
    expect(encodedDoc instanceof Object).toBeTruthy();
  });

  test('Decoding', () => {
    let decodedDocument = Document.decode(Document.encode(document));
    expect(decodedDocument instanceof Document).toBeTruthy();
  });

  test('Document integrity', () => {
    const compare = () => {
      let otherDocument = Document.decode(Document.encode(document));
      expect(document.equals(otherDocument)).toBeTruthy();
    };

    compare();

    insertParagraph(document);

    compare();
  });
});


describe('Events', () => {
  test('Update', () => {
    insertParagraph(document);
    expect(docUpdateEventMock.mock.calls.length).toBe(1);

    const [firstParam, secondParam] = docUpdateEventMock.mock.calls[0];
    expect(firstParam).toHaveProperty('update');
    expect(firstParam.update instanceof Uint8Array).toBeTruthy();

    expect(firstParam).toHaveProperty('origin');
    expect(firstParam.origin).toHaveProperty('content');
    expect(firstParam.origin.content).toBe('insert');

    expect(secondParam instanceof Document).toBeTruthy();
    expect(secondParam.equals(document)).toBeTruthy();

    removeParagraph(document);
    expect(docUpdateEventMock.mock.calls.length).toBe(2);
  });

  test('Update off', () => {
    document.off('update', docUpdateEventMock);

    insertParagraph(document);
    expect(docUpdateEventMock).not.toHaveBeenCalled();
  });
});

describe('Cloning', () => {
  test('Clone', () => {
    let clonedDocument = document.clone();
    expect(clonedDocument instanceof Document).toBeTruthy();
    expect(clonedDocument.equals(document)).toBeTruthy();

    insertParagraph(clonedDocument);

    clonedDocument = clonedDocument.clone();
    expect(clonedDocument.equals(document)).not.toBeTruthy();
  });
});

describe('Sync', () => {
  test('No delay', () => {
    const documentsCount = 20;
    const changesCount = 50;
    const documents = [];

    jest.setTimeout(documentsCount * changesCount * 100);

    const handleUpdate = docClientID => ({ update }) => {
      documents
        .filter(document => filterDocument(docClientID)({ document }))
        .map(document => document.applyUpdate(update));
    };

    for (let index = 0; index < documentsCount; index++) {
      const document = new Document();
      document.on('update', handleUpdate(document.doc.clientID));
      documents.push(document);
    }

    for (const document of documents) {
      handleUpdate(document.doc.clientID)({ update: document.docState });
    }

    for (let index = 0; index < changesCount; index++) {
      const document = documents[randomBetween(0, documentsCount)];
      insertParagraph(document);
    }

    const content = documents[randomBetween(0, documentsCount)].content.toString();

    const allSame = documents.every(document => {
      return document.content.toString() === content;
    });

    expect(allSame).toBeTruthy();
  });

  test('Delayed', async () => {
    const documentsCount = 10;
    const changesCount = 20;
    const [minDelay, maxDelay] = [200, 1000];   // Inclusive.
    const documents = [];
    const promises = [];

    jest.setTimeout(15000);

    // Simulate delay
    const replicateChanges = (docClientID, update) => {
      return documents
        .filter(filterDocument(docClientID))
        .map(({ document, updateQueue }) => {
          updateQueue.push(update);

          return new Promise((resolve) => {
            setTimeout(() => {
              // Get next update and apply
              const update = updateQueue.shift();
              document.applyUpdate(update);
              resolve();
            }, randomBetween(minDelay, maxDelay));
          });
        });
    };

    for (let index = 0; index < documentsCount; index++) {
      const document = new Document();
      document.on('update', ({ update }) => promises.push(...replicateChanges(document.doc.clientID, update)));
      documents.push({ document, updateQueue: [] });
    }

    for (const { document } of documents) {
      await Promise.all(replicateChanges(document.doc.clientID, document.docState));
    }

    Array.from({ length: changesCount }).forEach(() => {
      const { document } = documents[randomBetween(0, documentsCount)];
      insertParagraph(document);
    });

    // Wait for all unpdates
    await Promise.all(promises);

    // Check picking a random document against others
    const content = documents[randomBetween(0, documentsCount)].document.content.toString();

    const allSame = documents.every(({ document }) => {
      return document.content.toString() === content;
    });

    expect(allSame).toBeTruthy();
  });
});
