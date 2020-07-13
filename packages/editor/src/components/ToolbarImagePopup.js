//
// Copyright 2020 DXOS.org
//

import React, { useState, useCallback } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';

import { DialogTitle } from '@material-ui/core';

const initialState = { src: '', title: '', alt: '' };

const ToolbarImagePopup = ({
  open = false,
  onClose = () => null,
  onSubmit = () => null,
  srcLabel = 'Image URL address'
}) => {
  const [state, setState] = useState(initialState);

  const handleImageFieldChange = field => useCallback(event => {
    event.persist();
    setState(state => ({ ...state, [field]: event.target.value }));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(state);
    setState(initialState);
  }, [state, onSubmit]);

  const handleClose = useCallback(() => {
    onClose();
    setState(initialState);
  }, [onClose]);

  const { src, title, alt } = state;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='image-dialog-title'
    >
      <DialogTitle>Insert image</DialogTitle>
      <DialogContent>
        <TextField
          value={title}
          onChange={handleImageFieldChange('title')}
          autoFocus
          margin='dense'
          id='image-title'
          label='Title'
          type='text'
          fullWidth
          variant='outlined'
        />
        <TextField
          value={alt}
          onChange={handleImageFieldChange('alt')}
          margin='dense'
          id='image-alt'
          label='Description'
          type='text'
          fullWidth
          variant='outlined'
        />
        <TextField
          value={src}
          onChange={handleImageFieldChange('src')}
          required
          margin='dense'
          id='image-src'
          label={srcLabel}
          fullWidth
          variant='outlined'
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          Cancel
        </Button>
        <Button
          disabled={src.trim() === ''}
          onClick={handleSubmit}
          color='primary'
        >
          Insert image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ToolbarImagePopup;
