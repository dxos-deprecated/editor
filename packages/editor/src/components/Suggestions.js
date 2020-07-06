//
// Copyright 2020 DXOS.org
//

import React, { useState, useCallback, useEffect } from 'react';

import { suggestionsPluginKey } from '../plugins/suggestions-plugin';

import {
  KEY_ARROW_UP,
  KEY_ARROW_DOWN,
  KEY_ESCAPE,
  KEY_ENTER,
  KEY_TAB,
  KEY_SPACE
} from '../lib/keys';

import { UnfocusedMenu } from './Menu';
import { useProsemirrorView, useProsemirrorTransaction } from '../lib/hook';

const Suggestions = ({
  getOptions = () => [],
  renderMenuItem,
  emptyOptionsLabel = 'None',
  maxVisibleItems = 8,
  onSelect = () => null
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState();
  const [query, setQuery] = useState();
  const [position, setPosition] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [start, setStart] = useState();
  const [end, setEnd] = useState();

  const [prosemirrorView] = useProsemirrorView();
  const [prosemirrorTransaction] = useProsemirrorTransaction();

  useEffect(() => {
    if (!prosemirrorTransaction) return;

    const { transaction } = prosemirrorTransaction;

    const meta = transaction.getMeta(suggestionsPluginKey);

    if (!meta) return;

    if (meta.open !== undefined) {
      if (!open && meta.open) {
        return handleOpenMenu(meta);
      }

      if (open && !meta.open) {
        return setOpen(false);
      }
    }

    if (meta.query !== undefined && query !== meta.query) {
      setStart(meta.start);
      setEnd(meta.end);

      updateOptions(meta.query);

      return;
    }

    handleKeyPressed(meta.keyPressed);
  }, [prosemirrorTransaction, open, query]);

  const handleSelectOption = useCallback(option => {
    onSelect(option, prosemirrorView, start, end);
    prosemirrorView.focus();
  }, [prosemirrorView, onSelect, start, end]);

  const handleCloseMenu = useCallback(() => {
    setOpen(false);

    prosemirrorView.dispatch(
      prosemirrorView.state.tr.setMeta(suggestionsPluginKey, {
        open: false
      })
    );
  }, [prosemirrorView]);

  const handleContextMenu = useCallback(event => {
    event.preventDefault();
    event.persist();

    setOpen(true);
    setPosition({
      top: event.clientY,
      left: event.clientX
    });
  }, []);

  const updateOptions = useCallback(query => {
    const options = getOptions(query || '');

    if (options.length === 0 && query !== null) {
      handleCloseMenu();
      return false;
    }

    setOptions(options);
    setQuery(query);
    setSelectedIndex(0);

    return true;
  }, [getOptions, handleCloseMenu]);

  const handleOpenMenu = useCallback(({ position, query, start, end }) => {
    if (!updateOptions(query)) return;

    setOpen(true);
    setPosition(position);
    setSelectedIndex(0);
    setStart(start);
    setEnd(end);
  }, [updateOptions]);

  const handleKeyPressed = useCallback(key => {
    if (!key) return;

    switch (key) {
      case KEY_ARROW_UP:
        if (selectedIndex < 1) break;
        setSelectedIndex(selectedIndex => selectedIndex - 1);
        break;

      case KEY_ARROW_DOWN:
        if (selectedIndex >= options.length - 1) break;
        setSelectedIndex(selectedIndex => selectedIndex + 1);
        break;

      case KEY_ESCAPE:
      case KEY_SPACE:
        handleCloseMenu();
        break;

      case KEY_ENTER:
      case KEY_TAB:
        handleSelectOption(options[selectedIndex]);
        handleCloseMenu();
        break;

      default:
        break;
    }

    prosemirrorView.dispatch(
      prosemirrorView.state.tr.setMeta(suggestionsPluginKey, {
        keyPressed: null
      })
    );
  }, [selectedIndex, options]);

  if (!prosemirrorView) return null;
  if (!open) return null;

  return (
    <UnfocusedMenu
      options={options}
      onSelect={handleSelectOption}
      onClose={handleCloseMenu}
      onContextMenu={handleContextMenu}
      position={position}
      renderMenuItem={renderMenuItem}
      emptyOptionsLabel={emptyOptionsLabel}
      maxVisibleItems={maxVisibleItems}
      selectedIndex={selectedIndex}
    />
  );
};

export default Suggestions;
