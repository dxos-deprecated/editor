//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';

import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';

import ToolbarButton from './ToolbarButton';
import { linkMark } from '../lib/prosemirror-helpers';

class ToolbarLinkButton extends Component {

  state = {
    dialogOpen: false,
    href: '',
    title: ''
  }

  handleClickOpen = () => {
    const { selectedLinkNodes } = this.props;

    let attrs = { href: '', title: '' };

    if (selectedLinkNodes.length === 1) {
      const node = selectedLinkNodes[0];
      ({ attrs } = linkMark(node));
    }

    this.setState({ dialogOpen: true, ...attrs });
  };

  handleClose = () => {
    this.setState({ dialogOpen: false, href: '', title: '' });
  };

  handlelinkUrlChange = event => {
    this.setState({ href: event.target.value });
  }

  handleLinkTextChange = event => {
    this.setState({ title: event.target.value });
  }

  handleSetLink = () => {
    const { onSetLink } = this.props;
    const { title, href } = this.state;

    onSetLink(title, href);
    this.handleClose();
  }

  render() {
    const { disabled = false, onRemoveLink, selectedLinkNodes } = this.props;
    const { href, title, dialogOpen } = this.state;

    return (
      <div>
        <ToolbarButton
          icon={LinkIcon}
          title={'Set link'}
          onClick={this.handleClickOpen}
          disabled={disabled}
        />
        {<ToolbarButton
          icon={LinkOffIcon}
          title={'Remove link'}
          onClick={onRemoveLink}
          disabled={selectedLinkNodes.length === 0}
        />}
        <Dialog open={dialogOpen} onClose={this.handleClose} aria-labelledby="link-dialog-title">
          <DialogContent>
            <TextField
              value={title}
              onChange={this.handleLinkTextChange}
              autoFocus
              margin="dense"
              id="link-title"
              label="Title"
              type="text"
              fullWidth
              variant="outlined"
            />
            <TextField
              value={href}
              onChange={this.handlelinkUrlChange}
              margin="dense"
              id="link-url"
              label="Link address"
              type="url"
              fullWidth
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button disabled={href === ''} onClick={this.handleSetLink} color="primary">
              Set link
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}


export default ToolbarLinkButton;