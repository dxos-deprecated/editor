//
// Copyright 2020 DXOS.org
//

import React, { useCallback, useState } from 'react';

import { makeStyles, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import { Editor } from '../src';
import { TextSelection } from 'prosemirror-state';

const useStyles = makeStyles(theme => ({
  styled: {
    marginLeft: 4,
    marginRight: 4,

    '& > .react-element-content': {
      backgroundColor: '#ccc',
      padding: 4
    },

    '&.selected': {
      outline: `thin solid ${theme.palette.secondary.main}`
    }
  }
}));

const ExampleComponent = () => {
  const [buttons, setButtons] = useState(['Hi']);
  const [buttonLabel, setButtonLabel] = useState('');

  const handleChangeTextField = useCallback(event => {
    setButtonLabel(event.target.value);
  }, []);

  const handleAddButton = useCallback(() => {
    setButtons(buttons => [...buttons, buttonLabel]);
  }, [buttonLabel]);

  return (
    <div>
      {buttons.map((button, i) => <Button key={i} color='primary' variant='outlined'>{button}</Button>)}
      <br />
      <TextField label='Button label' value={buttonLabel} onChange={handleChangeTextField} />
      <Button variant='outlined' onClick={handleAddButton}>Add button</Button>
    </div>
  );
};

const ReactContent = () => {
  const classes = useStyles();

  const handleCreated = useCallback((editor) => {
    let { tr } = editor.view.state;

    tr = tr.setSelection(TextSelection.create(tr.doc, editor.view.state.doc.content.size));

    editor.view.dispatch(tr);

    editor.createInlineReactElement({ id: 'dynamic-component' });
  }, []);

  // Here you decide what/how to render
  const handleReactElementRender = props => {
    if (props.id === 'example-component') {
      return <ExampleComponent {...props} />;
    }

    if (props.id === 'dynamic-component') {
      return (
        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            console.log('Button click', JSON.stringify(props, null, 2));
          }}
        >
        Inserted dynamically
        </Button>
      );
    }

    if (props.id === 'textarea-component') {
      return <textarea rows={5} defaultValue='Textarea content' />;
    }
  };

  return (
    <Editor
      schema='full'
      onCreated={handleCreated}
      reactElementRenderFn={handleReactElementRender}
      initialContent={[
        '<p>Next element is a <strong>BLOCK</strong> react element:</p>',
        '<blockreactelement props="%7B%22id%22:%22example-component%22%7D" class="" contenteditable="false"></blockreactelement>',
        '<p>and next element is a <strong>INLINE</strong> react element: <inlinereactelement props="%7B%22id%22:%22example-component%22%7D" class="" contenteditable="false" /></p>',
        `<p><strong>STYLED INLINE</strong> react element: <inlinereactelement props="%7B%22id%22:%22example-component%22%7D" class="${classes.styled}" contenteditable="false" /></p>`,
        '<p>textarea from React <strong>INLINE</strong>: <inlinereactelement props="%7B%22id%22:%22textarea-component%22%7D" class="" contenteditable="false" /></p>'
      ].join('')}
    />
  );
};

export default ReactContent;
