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
  emptyOptionsLabel = 'None',
  getOptions = () => [],
  maxVisibleItems = 8,
  onSelect = () => null,
  orientation,
  renderMenuItem,
  triggerEventKeys
}) => {
  const [opened, setOpened] = useState(false);
  const [options, setOptions] = useState();
  const [query, setQuery] = useState();
  const [position, setPosition] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [keyPressed, setKeyPressed] = useState();
  const [disabledKeys, setDisabledKeys] = useState({});

  const [prosemirrorView] = useProsemirrorView();
  const [prosemirrorTransaction] = useProsemirrorTransaction();

  const handleUpdate = useCallback(meta => {
    switch (meta.do) {
      case 'open':
        setPosition(meta.position);
        setStart(meta.start);
        setEnd(meta.end);
        setQuery(meta.query);
        setOpened(meta.opened);
        break;

      case 'query':
        setStart(meta.start);
        setEnd(meta.end);
        setQuery(meta.query);
        break;

      case 'keyPressed':
        setKeyPressed(meta.code);
        break;

      default:
        break;
    }
  }, []);

  const handleSelectOption = useCallback(option => {
    const run = async () => {
      const replaceWith = (text, linkAttrs = false) => {
        const { schema } = prosemirrorView.state;
        let { tr } = prosemirrorView.state;

        tr = tr.insertText(`${text} `, start, end + 1);

        if (schema.marks.link && linkAttrs) {
          tr = tr.addMark(start, start + text.length, schema.mark(schema.marks.link, linkAttrs));
        }

        prosemirrorView.dispatch(tr);

        prosemirrorView.focus();
      };

      await onSelect(option, { prosemirrorView, start, end, replaceWith });

      handleCloseMenu();
    };

    run();
  }, [prosemirrorView, onSelect, start, end]);

  const handleSelectOptionIndex = useCallback(() => {
    handleSelectOption(options.filter(option => !option.subheader)[selectedIndex]);
  }, [options, selectedIndex]);

  const handleCloseMenu = useCallback(() => {
    prosemirrorView.dispatch(
      prosemirrorView.state.tr.setMeta(suggestionsPluginKey, {
        do: 'open',
        opened: false
      })
    );
  }, [prosemirrorView]);

  const handleContextMenu = useCallback(event => {
    event.preventDefault();
    event.persist();

    setOpened(true);
    setPosition({
      top: event.clientY,
      left: event.clientX
    });
  }, []);

  // SelectedIndex or options change
  useEffect(() => {
    if (!options) return;

    const justOptions = options.filter(option => !option.subheader);

    setDisabledKeys({
      [KEY_ARROW_DOWN]: selectedIndex === justOptions.length - 1,
      [KEY_ARROW_UP]: selectedIndex === 0
    });
  }, [selectedIndex, options]);

  useEffect(() => {
    if (!prosemirrorTransaction) return;

    const { transaction } = prosemirrorTransaction;

    const meta = transaction.getMeta(suggestionsPluginKey);

    if (meta) {
      handleUpdate(meta);
    }
  }, [prosemirrorTransaction, handleUpdate]);

  // Query changes
  useEffect(() => {
    if (query !== undefined) {
      setOptions(getOptions(query));
    }
  }, [query, getOptions]);

  // Options change
  useEffect(() => {
    if (options !== undefined) {
      if (options.length === 0) {
        handleCloseMenu();
      }

      setSelectedIndex(0);
    }
  }, [options, handleCloseMenu]);

  // Key changes
  useEffect(() => {
    if (!keyPressed || disabledKeys[keyPressed]) return;

    switch (keyPressed) {
      case KEY_ARROW_UP:
      case KEY_ARROW_DOWN:
        setSelectedIndex(selectedIndex => selectedIndex + (keyPressed === KEY_ARROW_UP ? -1 : 1));
        break;

      case KEY_ESCAPE:
      case KEY_SPACE:
        handleCloseMenu();
        break;

      case KEY_ENTER:
      case KEY_TAB:
        handleSelectOptionIndex();
        break;

      default:
        break;
    }

    setKeyPressed(undefined);
  }, [keyPressed, disabledKeys]);

  if (!prosemirrorView) return null;
  if (!opened) return null;
  if (!options || options.length === 0) return null;

  return (
    <UnfocusedMenu
      emptyOptionsLabel={emptyOptionsLabel}
      maxVisibleItems={maxVisibleItems}
      onClose={handleCloseMenu}
      onContextMenu={handleContextMenu}
      onSelect={handleSelectOption}
      options={options || []}
      orientation={orientation}
      position={position}
      renderMenuItem={renderMenuItem}
      selectedIndex={selectedIndex}
    />
  );
};

export default Suggestions;
