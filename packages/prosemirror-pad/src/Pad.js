//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import { withLogView } from '@wirelineio/appkit';

import ProsemirrorPad from './ProsemirrorPad';

import { view } from './defs';
import { compose } from 'react-apollo';

class Pad extends Component {

  render() {
    const { itemId, appendChange, logs } = this.props;

    if (!itemId) return null;

    return <ProsemirrorPad itemId={itemId} appendChange={appendChange} logs={logs} />;
  }
}

export default compose(
  withLogView({ view })
)(Pad);
