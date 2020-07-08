//
// Copyright 2020 DXOS.org
//

import React, { Component } from 'react';

import ImageIcon from '@material-ui/icons/Image';

import ToolbarButton from './ToolbarButton';
import { canInsert } from '../lib/prosemirror-helpers';
import ToolbarImagePopup from './ToolbarImagePopup';

class ToolbarImageButton extends Component {
  static defaultProps = {
    view: undefined
  }

  state = {
    dialogOpen: false
  };

  handleClickOpen = () => {
    this.setState({
      dialogOpen: true
    });
  };

  handleClose = () => {
    this.setState({
      dialogOpen: false
    });
  };

  handleInsertImage = ({ title, src, alt }) => {
    const { view } = this.props;
    const { state, dispatch } = view;

    const img = state.schema.nodes.image.createAndFill({ src, alt, title });
    dispatch(state.tr.replaceSelectionWith(img));
    view.focus();

    this.handleClose();
  };

  render () {
    const {
      view: { state },
      popupSrcLabel
    } = this.props;
    const { dialogOpen } = this.state;

    return (
      <div>
        <ToolbarButton
          icon={ImageIcon}
          title='Insert image'
          onClick={this.handleClickOpen}
          disabled={!canInsert(state.schema.nodes.image)(state)}
        />
        <ToolbarImagePopup
          srcLabel={popupSrcLabel}
          open={dialogOpen}
          onClose={this.handleClose}
          onSubmit={this.handleInsertImage}
        />
      </div>
    );
  }
}

export default ToolbarImageButton;
