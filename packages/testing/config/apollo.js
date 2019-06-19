//
// Copyright 2019 Wireline, Inc.
//

import merge from 'lodash.merge';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import randomAccessMemory from 'random-access-memory';

import { KappaLink } from '@wirelineio/apollo-link-kappa';
import { DSuite } from '@wirelineio/dsuite-core';
import swarm from '@wirelineio/discovery-swarm-memory';

import { kappaStores, localStores } from '@wirelineio/appkit';

/**
 * Create Apollo client.
 */
export const createClient = async ({ partyKey }) => {

  const dsuite = new DSuite({
    swarm,
    storage: randomAccessMemory,
    partyKey
  });

  const kappaCore = dsuite.core;

  const kappaLink = new KappaLink({
    kappa: kappaCore,
    resolvers: merge(...kappaStores)
  });

  // App state.
  const cache = new InMemoryCache();

  const client = new ApolloClient({
    link: ApolloLink.from([kappaLink]),
    resolvers: merge(...localStores),
    cache
  });

  // Initialize control feed, swarm and set the initial party connection based on conf.partyKey.
  await dsuite.initialize();

  // Load initial feeds for the currentPartyKey. Default is to lazy load feeds on connection.
  await dsuite.mega.loadFeeds([
    'control-feed/*',
    `party-feed/${dsuite.currentPartyKey.toString('hex')}/*`
  ]);

  return { client, dsuite };
};
