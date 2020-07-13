//
// Copyright 2020 DXOS.org
//

import React, { useState, useEffect, useCallback } from 'react';

import { FocusedMenu } from './Menu';

import { contextMenuPluginKey } from '../plugins/context-menu-plugin';
import { useProsemirrorView, useProsemirrorTransaction } from '../lib/hook';

const ContextMenu = ({
  getOptions = () => [],
  renderMenuItem,
  emptyOptionsLabel = 'None',
  maxVisibleItems = 8,
  onSelect = () => null
}) => {
  const [state, setState] = useState({
    open: false,
    position: { top: 0, left: 0 },
    options: []
  });

  const [prosemirrorView] = useProsemirrorView();
  const [prosemirrorTransaction] = useProsemirrorTransaction();

  useEffect(() => {
    if (!prosemirrorTransaction) return;

    const { transaction } = prosemirrorTransaction;

    const meta = transaction.getMeta(contextMenuPluginKey);
    if (!meta) return;

    if (meta.open !== undefined) {
      setState(state => {
        const newState = { open: meta.open };

        if (meta.open) {
          newState.options = getOptions();
          newState.position = meta.position;
        }

        return newState;
      });
    }
  }, [prosemirrorTransaction]);

  const handleCloseMenu = useCallback(() => {
    setState(state => ({ ...state, open: false }));

    prosemirrorView.dispatch(
      prosemirrorView.state.tr.setMeta(contextMenuPluginKey, {
        open: false
      })
    );
  }, [prosemirrorView]);

  const handleSelectOption = useCallback(option => {
    onSelect(option, prosemirrorView);
    setState(state => ({ ...state, open: false }));

    prosemirrorView.focus();
  }, [prosemirrorView, onSelect]);

  const handleContextMenu = useCallback(event => {
    event.preventDefault();
    event.persist();

    prosemirrorView.dispatch(
      prosemirrorView.state.tr.setMeta(contextMenuPluginKey, {
        open: false,
        position: {
          top: event.clientY,
          left: event.clientX
        }
      })
    );
  }, [prosemirrorView]);

  if (!prosemirrorView) return null;

  return (
    <FocusedMenu
      open={state.open}
      dom={prosemirrorView.dom}
      options={state.options}
      onSelect={handleSelectOption}
      onClose={handleCloseMenu}
      onContextMenu={handleContextMenu}
      position={state.position}
      renderMenuItem={renderMenuItem}
      emptyOptionsLabel={emptyOptionsLabel}
      maxVisibleItems={maxVisibleItems}
    />
  );
};

export default ContextMenu;
