//
// Copyright 2020 DXOS.org
//

import React, { useState, useCallback } from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const initialState = { src: '', title: '', alt: '' };

const ToolbarImagePopup = ({
  open = false,
  onClose = () => null,
  onSubmit = () => null,
  onUpload = () => null
}) => {
  const [state, setState] = useState(initialState);

  async function handleFileInputChange (event) {
    event.persist();
    const image = event.target.files[0];

    if (!image) return;

    try {
      const imageSource = await onUpload(image);
      setState(state => ({ ...state, src: imageSource }));
    } catch (error) {
      console.log(error);
    }
  }

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
        <Box
          bgcolor='background.paper'
          border={1}
          borderRadius='borderRadius'
          borderColor='text.primary'
          p={1}
          marginTop={1}
        >
          <TextField
            value={src}
            onChange={handleImageFieldChange('src')}
            required
            margin='dense'
            label='Image source'
            fullWidth
            variant='outlined'
          />
          <Box m={1.5} marginTop={1}>
            <Typography align='center'>- OR -</Typography>
          </Box>
          <input
            accept='image/*'
            id='button-file'
            type='file'
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <label htmlFor='button-file'>
            <Button
              component='span'
              variant='outlined'
              fullWidth
            >
              Upload image
            </Button>
          </label>
        </Box>
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
