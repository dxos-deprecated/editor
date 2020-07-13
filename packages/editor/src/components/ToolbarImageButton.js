//
// Copyright 2020 DXOS.org
//

import React, { useState, useCallback } from 'react';

import ImageIcon from '@material-ui/icons/Image';

import ToolbarButton from './ToolbarButton';
import ToolbarImagePopup from './ToolbarImagePopup';

import { canInsert } from '../lib/prosemirror-helpers';
import { useProsemirrorView } from '../lib/hook';

const ToolbarImageButton = ({
  popupSrcLabel
}) => {
  const [prosemirrorView] = useProsemirrorView();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClickOpen = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleInsertImage = useCallback(({ title, src, alt }) => {
    const { state, dispatch } = prosemirrorView;

    const img = state.schema.nodes.image.createAndFill({ src, alt, title });
    dispatch(state.tr.replaceSelectionWith(img));
    prosemirrorView.focus();

    handleClose();
  }, [prosemirrorView]);

  const { state } = prosemirrorView;

  return (
    <div>
      <ToolbarButton
        name='image-node'
        icon={ImageIcon}
        title='Insert image'
        onClick={handleClickOpen}
        disabled={!canInsert(state.schema.nodes.image)(state)}
      />
      <ToolbarImagePopup
        srcLabel={popupSrcLabel}
        open={dialogOpen}
        onClose={handleClose}
        onSubmit={handleInsertImage}
      />
    </div>
  );
};

export default ToolbarImageButton;
