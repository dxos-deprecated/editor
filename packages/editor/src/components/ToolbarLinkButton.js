//
// Copyright 2020 Wireline, Inc.
//

import React, { useState, useCallback } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';

import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';

import ToolbarButton from './ToolbarButton';
import { linkMark } from '../lib/prosemirror-helpers';

// eslint-disable-next-line no-useless-escape
const validURLRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gim;

const ToolbarLinkButton = ({
  selectedLinkNodes,
  view: {
    state: { schema }
  },
  disabled = false,
  onRemoveLink
}) => {
  const [state, setState] = useState({
    dialogOpen: false,
    href: '',
    title: '',
    error: undefined
  });

  const handleClickOpen = useCallback(() => {
    let attrs = { href: '', title: '', error: undefined };

    if (selectedLinkNodes.length === 1) {
      const node = selectedLinkNodes[0];
      ({ attrs } = linkMark(schema)(node));
    }

    setState({ dialogOpen: true, ...attrs });
  }, []);

  const handleClose = useCallback(() => {
    setState({ dialogOpen: false, href: '', title: '', error: undefined });
  }, []);

  const handlelinkUrlChange = useCallback(event => {
    setState(state => ({ ...state, href: event.target.value, error: undefined }));
  }, []);

  const handleLinkTextChange = useCallback(event => {
    setState(state => ({ ...state, title: event.target.value }));
  }, []);

  const handleSetLink = useCallback(() => {
    const { onSetLink } = this.props;
    const { title, href } = this.state;

    if (!validURLRegex.test(href)) {
      return setState(state => ({ ...state, error: 'Invalid URL' }));
    }

    onSetLink(title, href);
    handleClose();
  }, []);

  return (
    <div>
      <ToolbarButton
        icon={LinkIcon}
        title='Set link'
        onClick={handleClickOpen}
        disabled={disabled}
      />
      {
        <ToolbarButton
          icon={LinkOffIcon}
          title='Remove link'
          onClick={onRemoveLink}
          disabled={selectedLinkNodes.length === 0}
        />
      }
      <Dialog
        open={state.dialogOpen}
        onClose={handleClose}
        aria-labelledby='link-dialog-title'
      >
        <DialogContent>
          <TextField
            value={state.title}
            onChange={handleLinkTextChange}
            autoFocus
            margin='dense'
            id='link-title'
            label='Title'
            type='text'
            fullWidth
            variant='outlined'
          />
          <TextField
            value={state.href}
            onChange={handlelinkUrlChange}
            margin='dense'
            id='link-url'
            label='Link address'
            type='url'
            fullWidth
            variant='outlined'
            error={Boolean(state.error)}
            helperText={state.error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button
            disabled={state.href === ''}
            onClick={handleSetLink}
            color='primary'
          >
            Set link
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ToolbarLinkButton;
