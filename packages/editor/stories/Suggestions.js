//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import Chip from '@material-ui/core/Chip';

import { Editor } from '../src';

function Suggestions () {
  const [editor, setEditor] = useState();

  function handleGetOptions (query = '') {
    return [
      { subheader: 'First subheader' },
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
      { subheader: 'Second subheader' },
      { id: 3, label: 'AB' },
      { id: 4, label: '---' },
      { id: 5, label: 'Spaces allowed' }
    ].filter(option => option.subheader || option.label.toLowerCase().includes(query.toLowerCase()));
  }

  function handleSelect (option) {
    editor.createInlineReactElement({ type: 'suggestion', ...option });
  }

  function handleRenderItem (option) {
    return `${option.id} - ${option.label}`;
  }

  function handleKeyDown ({ key }) {
    if (key === 'Enter') {
      console.log('Enter pressed');
      return true;
    }

    return false;
  }

  function handleReactElementRender (props) {
    if (props.type !== 'suggestion') return null;

    const { label } = props;

    return (
      <Chip
        size='small'
        component='a'
        label={label}
        clickable
        color='primary'
        variant='outlined'
      />
    );
  }

  return (
    <Editor
      onCreated={setEditor}
      onKeyDown={handleKeyDown}
      suggestions={{
        getOptions: handleGetOptions,
        onSelect: handleSelect,
        renderMenuItem: handleRenderItem,
        maxListHeight: 200
      }}
      reactElementRenderFn={handleReactElementRender}
    />
  );
}

export default Suggestions;
