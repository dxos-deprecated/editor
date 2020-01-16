import React, { Component } from 'react';

import Button from '@material-ui/core/Button';

import { Editor } from '../src';

import { buildReactElementNodeView, reactElement } from './util';

class ReactContent extends Component {
  handleRenderReactNodeView = node => {
    return (
      <Button
        onClick={event => {
          event.preventDefault();
          console.log('Button click', JSON.stringify(node, null, 2));
        }}
      >
        Test
      </Button>
    );
  };

  handleCreated = ({ view }) => {
    const reactElement = view.state.schema.node('reactelement');

    view.dispatch(view.state.tr.insert(0, reactElement));
  };

  render() {
    return (
      <Editor
        schema="full"
        onCreated={this.handleCreated}
        schemaEnhancers={[reactElement]}
        nodeViews={{
          reactelement: buildReactElementNodeView(
            this.handleRenderReactNodeView
          )
        }}
      />
    );
  }
}

export default ReactContent;
