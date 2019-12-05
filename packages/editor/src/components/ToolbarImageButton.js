//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';

import ImageIcon from '@material-ui/icons/Image';

import ToolbarButton from './ToolbarButton';
import { canInsert } from '../lib/prosemirror-helpers';
import { schema } from '../lib/schema';

// eslint-disable-next-line no-useless-escape
const validURLRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/igm;

class ToolbarImageButton extends Component {

  state = {
    dialogOpen: false,
    src: '',
    title: '',
    alt: '',
    error: undefined
  }

  handleClickOpen = () => {
    this.setState({ dialogOpen: true, src: '', title: '', alt: '', error: undefined });
  };

  handleClose = () => {
    this.setState({ dialogOpen: false, src: '', title: '', alt: '', error: undefined });
  };

  handleImageFieldChange = field => event => {
    this.setState({ [field]: event.target.value, error: undefined });
  }

  handleInsertImage = () => {
    const { title, src, alt } = this.state;
    const { view } = this.props;
    const { state, dispatch } = view;

    if (!validURLRegex.test(src)) {
      return this.setState({ error: 'Invalid image URL address' });
    }

    const img = schema.nodes.image.createAndFill({ src, alt, title });
    dispatch(state.tr.replaceSelectionWith(img));
    view.focus();

    this.handleClose();
  }

  render() {
    const { view: { state } } = this.props;
    const { src, title, alt, error, dialogOpen } = this.state;

    return (
      <div>
        <ToolbarButton
          icon={ImageIcon}
          title="Insert image"
          onClick={this.handleClickOpen}
          disabled={!canInsert(schema.nodes.image)(state)}
        />
        <Dialog open={dialogOpen} onClose={this.handleClose} aria-labelledby="image-dialog-title">
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
              margin="dense"
              id="image-src"
              label="Image URL address"
              type="url"
              fullWidth
              variant="outlined"
              error={Boolean(error)}
              helperText={error}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button disabled={src === ''} onClick={this.handleInsertImage} color="primary">
              Insert image
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}


export default ToolbarImageButton;