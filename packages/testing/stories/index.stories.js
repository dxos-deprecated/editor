//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';
import { ApolloProvider, withApollo } from 'react-apollo';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean, number } from '@storybook/addon-knobs';

import ProsemirrorPad from '@wirelineio/prosemirror-pad';

import RandomText from '../src/random-text';
import { createItem } from '../src/item';

const FullViewport = story => <div style={{ width: '100%', height: '500px', display: 'flex' }}>{story()}</div>;

const ProsemirrorPadEditor = withApollo(ProsemirrorPad.main);
const RandomTextEditor = withApollo(RandomText);

const withItem = Wrapped => {
  return class ApolloDecorator extends Component {
    state = {}

    async componentDidMount() {
      const { item, client } = await createItem();
      this.setState({ item, client });
    }

    render() {
      const { item, client } = this.state;

      if (!item || !client) return <div>Loading...</div>;

      return (
        <ApolloProvider client={client}>
          <Wrapped item={item} {...this.props} />
        </ApolloProvider>
      );
    }
  };
};



const BasicProsemirror = withItem(({ item }) => (
  <>
    <ProsemirrorPadEditor match={{ params: item }} />
    <ProsemirrorPadEditor match={{ params: item }} />
  </>
));

const RandomTextProsemirror = withItem(({ item, options }) => (
  <>
    <RandomTextEditor match={{ params: item }} {...options} />
    <ProsemirrorPadEditor match={{ params: item }} />
  </>
));

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
