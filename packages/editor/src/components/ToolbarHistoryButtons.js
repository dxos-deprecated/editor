//
// Copyright 2020 DXOS.org
//

import React from 'react';

import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';

import ToolbarButton from './ToolbarButton';

const HISTORY_BUTTONS = {
  undo: { name: 'undo', title: 'Undo last change', icon: UndoIcon },
  redo: { name: 'redo', title: 'Redo last change', icon: RedoIcon }
};

const ToolbarHistoryButtons = React.memo(({ canUndo, canRedo, onClick }) => {
  return Object.values(HISTORY_BUTTONS)
    .map(({ name, title, icon }) => (
      <ToolbarButton
        name={name}
        icon={icon}
        title={title}
        key={name}
        onClick={onClick(name)}
        disabled={
          (name === 'undo' && !canUndo) ||
          (name === 'redo' && !canRedo)
        }
      />
    ));
});

ToolbarHistoryButtons.displayName = 'ToolbarHistoryButtons';

export default ToolbarHistoryButtons;
