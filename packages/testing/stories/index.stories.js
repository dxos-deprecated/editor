//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';
import { ApolloProvider, withApollo } from 'react-apollo';
import { storiesOf } from '@storybook/react';
import crypto from 'crypto';

import ProsemirrorPad from '@wirelineio/prosemirror-pad';

import { createClient } from '../config/apollo';

const randomKey = () => new Promise(resolve => crypto.randomBytes(32, function (err, buffer) {
  const token = buffer.toString('hex');
  resolve(token);
}));

const FullViewport = story => <div style={{ display: 'flex', height: '100vh', width: '100vw', padding: 12 }}>{story()}</div>;

const ProsemirrorPadEditor = withApollo(ProsemirrorPad.main);

const editorStyle = {
  margin: '0.1rem',
  background: '#fafafa',
  border: '1px solid #fdf',
  padding: '0.2rem'
};

class Prosemirror extends Component {
  state = {
    view: null,
    client: null
  }

  async componentDidMount() {
    const partyKey = await randomKey();

    const { client, dsuite } = await createClient({ partyKey });

    dsuite.registerView({ name: ProsemirrorPad.name, view: 'LogsView' });

    const view = await dsuite.api.prosemirror.create({ type: 'prosemirror', partyKey });

    this.setState({ view, client });
  }

  render() {
    const { view, client } = this.state;

    if (!view || !client) return <div>Loading...</div>;

    return (
      <ApolloProvider client={client}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          <ProsemirrorPadEditor style={editorStyle} match={{ params: { itemId: view.itemId } }} />
          <ProsemirrorPadEditor style={editorStyle} match={{ params: { itemId: view.itemId } }} />
        </div>
      </ApolloProvider>
    );
  }
}

storiesOf('Prosemirror', module)
  .addDecorator(FullViewport)
  .add('basic', () => {
    return <Prosemirror />;
  });
