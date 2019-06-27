//
// Copyright 2019 Wireline, Inc.
//

import crypto from 'crypto';

import ProsemirrorPad from '@wirelineio/prosemirror-pad';

import { createClient } from '../config/apollo';

const randomKey = () => new Promise(resolve => crypto.randomBytes(32, function (err, buffer) {
  const token = buffer.toString('hex');
  resolve(token);
}));

export const createItem = async () => {
  const partyKey = await randomKey();

  const { client, dsuite } = await createClient({ partyKey });

  window.dsuite = dsuite;

  dsuite.registerView({ name: ProsemirrorPad.name, view: 'LogsView' });

  const item = await dsuite.api.prosemirror.create({ type: 'prosemirror', partyKey });

  return { item, client };
};
