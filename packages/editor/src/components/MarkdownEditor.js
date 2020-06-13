import React, { useState, useCallback } from 'react';
import { Doc, encodeStateVector, applyUpdate, encodeStateAsUpdate } from 'yjs';

import { makeStyles } from '@material-ui/core/styles';

import Editor from './Editor';

import { fromMarkdown, toMarkdown } from '../lib/transform';
import { xmlParagraph, xmlText } from '../lib/transform/xml-fragment';

const useEditorStyles = makeStyles(() => ({
  root: {
    fontFamily: 'monospace'
  }
}));

const MarkdownEditor = ({ sync, onCreated = () => null }) => {
  const classes = useEditorStyles();
  const [syncDoc] = useState(sync && sync.doc ? sync.doc : new Doc());

  let syncProp;
  if (sync) {
    const handleLocalUpdate = useCallback((update, doc) => {
      const paragraphTextContent = doc.getXmlFragment('content').toString();
      const markdownString = paragraphTextContent.replace('<paragraph>', '').replace('</paragraph>', '');

      const oldSyncDocState = encodeStateVector(syncDoc);

      fromMarkdown(markdownString, syncDoc);

      console.clear();
      console.log('OUT ----');
      console.log(doc.getXmlFragment('content').toString());
      console.log(markdownString);
      console.log(syncDoc.getXmlFragment('content').toString());

      const diffUpdate = encodeStateAsUpdate(syncDoc, oldSyncDocState);

      sync.onLocalUpdate && sync.onLocalUpdate(diffUpdate, syncDoc);
    }, [sync]);

    syncProp = sync && {
      ...sync,
      doc: new Doc(),
      onLocalUpdate: handleLocalUpdate
    };
  }

  const handleEditorCreated = useCallback(editor => {
    if (sync) {
      editor.sync._processRemoteUpdate = editor.sync.processRemoteUpdate;

      editor.sync.processRemoteUpdate = (update, origin) => {
        applyUpdate(syncDoc, update, origin);

        // From shared syncDoc extract markdown as string;
        const inputContent = syncDoc.getXmlFragment('content');
        const markdownString = inputContent && toMarkdown(inputContent);

        console.clear();
        console.log('IN ---');
        console.log(markdownString);
        console.log(inputContent.toString());

        const { doc } = editor.sync;

        doc.transact(() => {
          const content = doc.getXmlFragment('content');
          if (content.length === 0) {
            const paragraph = xmlParagraph(markdownString);
            content.insert(0, [paragraph]);
          } else {
            const paragraph = content.toArray()[0];
            const text = paragraph.toArray()[0];

            if (!text) {
              paragraph.insert(0, [xmlText(markdownString)]);
              return;
            }

            text.delete(0, text.length);
            text.insert(0, markdownString);
          }
        }, origin);
      };
    }

    onCreated(editor);
  }, [onCreated]);

  return (
    <Editor
      schema='text-only'
      sync={syncProp}
      onCreated={handleEditorCreated}
      classes={classes}
    />
  );
};

export default MarkdownEditor;
