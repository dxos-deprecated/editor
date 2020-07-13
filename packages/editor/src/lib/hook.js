//
// Copyright 2020 DXOS.org
//

import { useContext } from 'react';

import { EditorContext } from './context';

export const useProsemirrorView = () => {
  const { prosemirrorView, setProsemirrorView } = useContext(EditorContext);

  return [prosemirrorView, setProsemirrorView];
};

export const useProsemirrorTransaction = () => {
  const { prosemirrorTransaction, setProsemirrorTransaction } = useContext(EditorContext);

  return [prosemirrorTransaction, setProsemirrorTransaction];
};
