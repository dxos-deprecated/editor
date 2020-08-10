//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useRef, useState } from 'react';

import { makeStyles } from '@material-ui/core';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import TextField from '@material-ui/core/TextField';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';

import { suggestionsPluginKey } from '../plugins/suggestions-plugin';

import {
  KEY_ARROW_UP,
  KEY_ARROW_DOWN,
  KEY_ESCAPE,
  KEY_ENTER,
  KEY_TAB
} from '../lib/keys';
import { useProsemirrorView, useProsemirrorTransaction } from '../lib/hook';

const useStyles = makeStyles(() => ({
  menu ({ maxListHeight }) {
    return {
      maxHeight: maxListHeight,
      overflowY: 'scroll'
    };
  }
}));

const Suggestions = ({
  emptyOptionsLabel = 'No options',
  getOptions = () => [],
  maxListHeight,
  onSelect = () => null,
  renderMenuItem
}) => {
  const classes = useStyles({ maxListHeight });
  const optionsMenuRef = useRef();
  const selectedOptionRef = useRef();

  const [open, setOpen] = useState(false);
  const [popperAnchorEl, setPopperAnchorEl] = useState(false);
  const [triggerKey, setTriggerKey] = useState('');

  const [options, setOptions] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [disabledKeys, setDisabledKeys] = useState({});

  const [prosemirrorView] = useProsemirrorView();
  const [prosemirrorTransaction] = useProsemirrorTransaction();

  const justOptions = options.filter(option => !option.subheader);

  const handleUpdate = meta => {
    if (meta.do !== 'open') return;

    setOpen(meta.open);
    setPopperAnchorEl(meta.anchorEl);
    setTriggerKey(meta.triggerKey);

    if (meta.open) {
      // Get all options
      setOptions(getOptions(''));
    }
  };

  useEffect(() => {
    if (!prosemirrorTransaction) return;

    const { transaction } = prosemirrorTransaction;

    const meta = transaction.getMeta(suggestionsPluginKey);

    if (meta) {
      handleUpdate(meta);
    }
  }, [prosemirrorTransaction]);

  useEffect(() => {
    if (open) {
      setOptions(getOptions(filterValue));

      setDisabledKeys(disabledKeys => ({
        ...disabledKeys,
        [KEY_TAB]: justOptions.length === 0,
        [KEY_ENTER]: justOptions.length === 0
      }));
    }
  }, [open, filterValue]);

  useEffect(() => {
    return handleClose;
  }, []);

  // SelectedIndex or options change
  useEffect(() => {
    if (!options) return;

    setDisabledKeys(disabledKeys => ({
      ...disabledKeys,
      [KEY_ARROW_DOWN]: selectedIndex === justOptions.length - 1,
      [KEY_ARROW_UP]: selectedIndex === 0
    }));

    // Scroll into option
    selectedOptionRef.current && selectedOptionRef.current.scrollIntoViewIfNeeded();
  }, [selectedIndex, options]);

  function handleSelectOption (option) {
    return async function _handleSelectOption (event) {
      await onSelect(option, { prosemirrorView });

      const { tr } = prosemirrorView.state;

      prosemirrorView.dispatch(tr.insertText(' ', tr.selection.to));

      handleClose();
    };
  }

  function handleKeyDown (event) {
    event.persist();
    if (event.key === KEY_ESCAPE) {
      handleClose();

      // Put trigger char back
      const { tr } = prosemirrorView.state;

      prosemirrorView.dispatch(tr.insertText(triggerKey, tr.selection.to));

      prosemirrorView.focus();
      return;
    }

    if (disabledKeys[event.key]) return;

    if ([KEY_ARROW_DOWN, KEY_ARROW_UP].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      setSelectedIndex(selectedIndex => selectedIndex + (event.key === KEY_ARROW_UP ? -1 : 1));
    }

    if ([KEY_ENTER, KEY_TAB].includes(event.key)) {
      handleSelectOption(justOptions[selectedIndex])();
    }
  }

  function handleClose () {
    // Close before waiting on PM dispatch
    setOpen(false);
    setFilterValue('');
    setOptions([]);
    setSelectedIndex(0);

    if (!prosemirrorView) return;

    let { tr } = prosemirrorView.state;

    tr = tr.scrollIntoView();
    tr = tr.setMeta(suggestionsPluginKey, {
      do: 'open',
      open: false
    });

    prosemirrorView.dispatch(tr);
    prosemirrorView.focus();
  }

  function handleFilterChange (event) {
    setFilterValue(event.target.value);
  }

  function handleFilterKeyDown (event) {
    if ([KEY_ARROW_DOWN, KEY_ARROW_UP, KEY_TAB, KEY_ENTER].includes(event.key)) {
      event.preventDefault();
    }
  }

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Popper
        onKeyDown={handleKeyDown}
        onClick={e => e.stopPropagation()}
        open={open}
        anchorEl={popperAnchorEl}
        placement='bottom-start'
        transition
        modifiers={{
          flip: {
            enabled: true
          },
          preventOverflow: {
            enabled: true,
            boundariesElement: 'scrollParent'
          }
        }}
      >
        <Paper
          elevation={5}
        >
          <TextField
            value={filterValue}
            onChange={handleFilterChange}
            autoFocus
            label='Filter'
            variant='outlined'
            onKeyDown={handleFilterKeyDown}
          />
          <MenuList
            dense
            disablePadding
            ref={optionsMenuRef}
            className={classes.menu}
          >
            {options.length === 0 && (
              <MenuItem disabled key='suggestions-empty' dense><ListItemText primary={emptyOptionsLabel} /></MenuItem>
            )}
            {(() => {
              let optionIndex = 0;
              let item;

              return options
                .map((option, index) => {
                  if (option.subheader) {
                    if ((options[index + 1] && options[index + 1].subheader) || index === options.length - 1) {
                      // Remove this option
                      return undefined;
                    }

                    const subheader = <MenuItem key={`subheader-${index}`} disabled dense classes={classes.subheader}>{option.subheader}</MenuItem>;

                    item = subheader;

                    if (index !== 0) {
                      item = [<Divider key={`divider-${index}`} className={classes.divider} />, subheader];
                    }
                  } else {
                    let listItemComponent;
                    let primaryText = option.label;

                    if (renderMenuItem) {
                      primaryText = renderMenuItem(option);
                      if (typeof primaryText !== 'string') {
                        listItemComponent = primaryText;
                      }
                    }

                    item = listItemComponent || (
                      <MenuItem
                        key={option.id}
                        selected={selectedIndex === optionIndex}
                        ref={selectedIndex === optionIndex ? selectedOptionRef : undefined}
                        onClick={handleSelectOption(option)}
                        dense
                      >
                        <ListItemText
                          primary={primaryText}
                        />
                      </MenuItem>
                    );

                    optionIndex++;
                  }

                  return item;
                })
                .flat()
                .filter(Boolean);
            })()}
          </MenuList>
        </Paper>
      </Popper>
    </ClickAwayListener>
  );
};

export default Suggestions;
