import React, { Component } from 'react';
import { ApolloProvider, withApollo } from 'react-apollo';
import { storiesOf } from '@storybook/react';
import crypto from 'crypto';

import ProsemirrorPad from 'prosemirror-pad';

import { createClient } from '../config/apollo';

const randomKey = () => new Promise(resolve => crypto.randomBytes(32, function (err, buffer) {
  const token = buffer.toString('hex');
  resolve(token);
}));

const FullViewport = story => <div style={{ display: 'flex', height: '100vh', width: '100vw', padding: 12 }}>{story()}</div>;

const ProsemirrorPadEditor = withApollo(ProsemirrorPad.main);

console.log({ ProsemirrorPad });

class Prosemirror extends Component {
  state = {
    view: null,
    client: null
  }

  async componentDidMount() {
    const partyKey = await randomKey();

    const { client, dsuite } = await createClient({ partyKey });

    window.dsuite = dsuite;

    dsuite.registerView({ name: ProsemirrorPad.name, view: 'LogsView' });

    const view = await dsuite.api.prosemirror.create({ type: 'prosemirror', partyKey });

    this.setState({ view, client });
  }

  render() {
    const { view, client } = this.state;

    if (!view || !client) return <div>Loading...</div>;

    return (
      <ApolloProvider client={client}>
        <div style={{ display: 'flex', flex: 1 }}>
          <ProsemirrorPadEditor match={{ params: { itemId: view.itemId } }} username={'Alice'} />
          <ProsemirrorPadEditor match={{ params: { itemId: view.itemId } }} username={'Bob'} />
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
