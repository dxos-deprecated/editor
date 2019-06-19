import React, { Component } from 'react';

import { withLogView } from '@wirelineio/appkit';

import ProsemirrorPad from './ProsemirrorPad';

import { view } from './defs';
import { compose } from 'react-apollo';

class Pad extends Component {

  render() {
    const { itemId, appendChange, logs, username } = this.props;

    if (!itemId) return null;

    return <ProsemirrorPad itemId={itemId} appendChange={appendChange} logs={logs} username={username} />;
  }
}

export default compose(
  // graphql(PROFILE_QUERY, {
  //   options() {
  //     return {
  //       fetchPolicy: 'network-only'
  //     };
  //   },
  //   props({ data: { profile } }) {
  //     return {
  //       profile
  //     };
  //   }
  // }),
  withLogView({ view })
)(Pad);
