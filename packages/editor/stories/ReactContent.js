import React, { useCallback } from 'react';

import Button from '@material-ui/core/Button';

import { Editor } from '../src';

const ReactContent = () => {
  const handleCreated = useCallback((editor) => {
    editor.createReactElement({ id: '1' });
    editor.createReactElement({ id: '2' });
  }, []);

  const handleReactElementRender = props => {
    console.log('render', props);
    return (
      <Button
        color={props.id === '1' ? 'primary' : 'secondary'}
        onClick={() => {
          console.log('Button click', JSON.stringify(props, null, 2));
        }}
      >
        Test
      </Button>
    );
  };

  return (
    <Editor
      schema="full"
      onCreated={handleCreated}
      reactElementRenderFn={handleReactElementRender}
    />
  );
};

export default ReactContent;
