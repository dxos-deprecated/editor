//
// Copyright 2020 Wireline, Inc.
//

const { useContext } = require('react');
const { EditorContext } = require('./context');

export const useProsemirrorView = () => {
  const { prosemirrorView, setProsemirrorView } = useContext(EditorContext);

  return [prosemirrorView, setProsemirrorView];
};

export const useProsemirrorTransaction = () => {
  const { prosemirrorTransaction, setProsemirrorTransaction } = useContext(EditorContext);

  return [prosemirrorTransaction, setProsemirrorTransaction];
};
