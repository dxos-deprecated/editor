//
// Copyright 2020 DXOS.org
//

import React, { useCallback } from 'react';

import Button from '@material-ui/core/Button';

import { Editor } from '../src';

const ReactContent = () => {
  const handleCreated = useCallback((editor) => {
    editor.createReactElement({ id: '1' });
    editor.createReactElement({ id: '2' });
  }, []);

  // Here you decide what/how to render
  const handleReactElementRender = props => {
    return (
      props.id === '1'
        ? (
          <Button
            variant='contained'
            color={props.id === '1' ? 'primary' : 'secondary'}
            onClick={() => {
              console.log('Button click', JSON.stringify(props, null, 2));
            }}
          >
          Test
          </Button>
        )
        : (
          <textarea rows={5} defaultValue='Ctrl + click to select element' />
        )
    );
  };

  return (
    <Editor
      schema='full'
      onCreated={handleCreated}
      reactElementRenderFn={handleReactElementRender}
    />
  );
};

export default ReactContent;
