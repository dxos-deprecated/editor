import React, { useCallback } from 'react';

import Button from '@material-ui/core/Button';

import { Editor } from '../src';

const ReactElement = (...props) => {
  return (
    <Button
      onClick={event => {
        event.preventDefault();
        console.log('Button click', JSON.stringify(props, null, 2));
      }}
    >
      Test
    </Button>
  );
};

const ReactContent = () => {
  const handleCreated = useCallback((editor) => {
    editor.insertReactElement(ReactElement, { a: 'a', b: 'b', c: [1, 2] });
  }, []);

  // const handleRenderReactElement = props => {

  // }

  return (
    <Editor
      schema="full"
      onCreated={handleCreated}
    />
  );
};

export default ReactContent;
