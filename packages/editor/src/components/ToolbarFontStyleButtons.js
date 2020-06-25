//
// Copyright 2020 Wireline, Inc.
//

import React, { useCallback } from 'react';

// import { markActive } from '../lib/prosemirror-helpers';

import { toggleMark } from 'prosemirror-commands';
import ToolbarFontSizePicker from './ToolbarFontSizePicker';

// const buildMarkButtons = schema => [
//   {
//     title: 'Font size',
//     isActive: markActive(schema.marks.fontSize),
//     fn: toggleMark(schema.marks.fontSize, { fontSize: 24 })
//   }
// ];

const ToolbarFontStyleButtons = ({ view }) => {
  const handleSelect = useCallback(value => {
    const { state, dispatch } = view;

    console.log('select', value);

    toggleMark(state.schema.marks.fontSize, { fontSize: value })(state, dispatch);
  }, [view]);

  const handleCancel = useCallback(() => {
    console.log('cancel');
  }, []);

  return (
    <ToolbarFontSizePicker
      initialValue='11'
      onSelect={handleSelect}
      onCancel={handleCancel}
    />
  );
};

export default ToolbarFontStyleButtons;
