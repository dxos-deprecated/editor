//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';
import { ApolloProvider, withApollo } from 'react-apollo';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean, number } from '@storybook/addon-knobs';

import ProsemirrorPad from '@wirelineio/prosemirror-pad';

import RandomText from '../src/random-text';
import { createView } from '../src/view';

const FullViewport = story => <div style={{ display: 'flex', height: '100vh', width: '100vw', padding: 12 }}>{story()}</div>;

const ProsemirrorPadEditor = withApollo(ProsemirrorPad.main);
const RandomTextEditor = withApollo(RandomText);

const editorStyle = {
  margin: '0.1rem',
  background: '#fafafa',
  border: '1px solid #fdf',
  padding: '0.2rem'
};

const withView = Wrapped => {
  return class ApolloDecorator extends Component {
    async componentDidMount() {
      const { view, client } = await createView();
      this.setState({ view, client });
    }

    state = {}

    render() {
      const { view, client } = this.state;

      if (!view || !client) return <div>Loading...</div>;

      return (
        <ApolloProvider client={client}>
          <Wrapped view={view} {...this.props} />
        </ApolloProvider>
      );
    }
  };
};



const BasicProsemirror = withView(({ view }) => {
  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
      <ProsemirrorPadEditor style={editorStyle} match={{ params: { itemId: view.itemId } }} />
      <ProsemirrorPadEditor style={editorStyle} match={{ params: { itemId: view.itemId } }} />
    </div>
  );
});

const RandomTextProsemirror = withView(({ view, options }) => {

  return (
    <div style={{ width: '100%' }}>
      <RandomTextEditor match={{ params: { itemId: view.itemId } }} {...options} />
      <ProsemirrorPadEditor style={editorStyle} match={{ params: { itemId: view.itemId } }} />
    </div>);
});

storiesOf('Prosemirror', module)
  .addDecorator(FullViewport)
  .addDecorator(withKnobs)
  .add('Basic', () => <BasicProsemirror />)
  .add('Random text from peer', () => {

    const options = {
      enabled: boolean('Auto text enabled', false),
      randomPosition: boolean('Insert at random position', false),
      randomDelay: boolean('Random delay between insertion', false),
      sentences: number('Number of sentences per paragraph', 4),
      delay: number('Delay (ms) between insertions (if random delay = false)', 1000),
      peers: number('Number of peers inserting text', 1),
    };

    return <RandomTextProsemirror options={options} />;
  });
