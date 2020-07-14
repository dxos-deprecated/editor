//
// Copyright 2020 DXOS.org
//

import React, { useCallback } from 'react';

import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import { Editor } from '../src';

const useStyles = makeStyles({
  blockEmbed: {
    backgroundColor: ' red'
  },

  inlineEmbed: {
    backgroundColor: '#ccc',
    marginLeft: 4,
    marginRight: 4
  }
});

const ReactContent = () => {
  const classes = useStyles();

  const handleCreated = useCallback((editor) => {
    editor.createReactElement({ id: 'button-component' }, { className: classes.blockEmbed });
    editor.createReactElement({ id: 'textarea-component' }, { className: classes.inlineEmbed, inline: true });
  }, []);

  // Here you decide what/how to render
  const handleReactElementRender = props => {
    return (
      props.id === 'button-component'
        ? (
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              console.log('Button click', JSON.stringify(props, null, 2));
            }}
          >
          Test
          </Button>
        )
        : (
          <textarea rows={5} defaultValue='Textarea content' />
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
