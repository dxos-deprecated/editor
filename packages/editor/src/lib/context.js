//
// Copyright 2020 Wireline, Inc.
//

import React, { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

export const EditorContext = React.createContext({
  setProsemirrorView: () => null,
  setProsemirrorTransaction: () => null
});

export const EditorContextProvider = ({ children }) => {
  const [prosemirrorView, setProsemirrorView] = useState();
  const [prosemirrorTransaction, setProsemirrorTransaction] = useState();

  const handleDebouncedProsemirrorTransaction = useCallback(debounce(
    transaction => {
      setProsemirrorTransaction(transaction);
    }, 150, { maxWait: 1000, leading: true }
  ), []);

  return (
    <EditorContext.Provider
      value={{
        prosemirrorView,
        setProsemirrorView,
        prosemirrorTransaction,
        setProsemirrorTransaction: handleDebouncedProsemirrorTransaction
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
