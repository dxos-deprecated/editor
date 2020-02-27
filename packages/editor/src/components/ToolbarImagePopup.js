//
// Copyright 2020 Wireline, Inc.
//

import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';

import { DialogTitle } from '@material-ui/core';

class ToolbarImagePopup extends Component {

  static defaultProps = {
    open: false,
    onClose: () => null,
    onSubmit: () => null,
    srcLabel: 'Image URL address'
  }

  state = {
    src: '',
    title: '',
    alt: ''
  };

  handleImageFieldChange = field => event => {
    this.setState({ [field]: event.target.value });
  };

  handleSubmit = () => {
    const { onSubmit } = this.props;
    const { title, src, alt } = this.state;

    onSubmit({ title, src, alt });
  }

  render() {
    const {
      open,
      onClose,
      srcLabel
    } = this.props;
    const { src, title, alt } = this.state;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="image-dialog-title"
      >
        <DialogTitle>Insert image</DialogTitle>
        <DialogContent>
          <TextField
            value={title}
            onChange={this.handleImageFieldChange('title')}
            autoFocus
            margin="dense"
            id="image-title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            value={alt}
            onChange={this.handleImageFieldChange('alt')}
            margin="dense"
            id="image-alt"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            value={src}
            onChange={this.handleImageFieldChange('src')}
            required
            margin="dense"
            id="image-src"
            label={srcLabel}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            disabled={src === ''}
            onClick={this.handleSubmit}
            color="primary"
          >
            Insert image
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ToolbarImagePopup;
