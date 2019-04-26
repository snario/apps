import React from 'react';
import StatusBarLayout from './status-bar-layout';

interface Props {
  name: string;
}

export default class WaitForOtherPlayer extends React.PureComponent<Props> {
  render() {
    const { name } = this.props;

    return (
      <StatusBarLayout>
        <h2>Waiting for the other player</h2>
        <p>
          We're waiting on the other player to complete their {name}. Hang tight and we'll let you
          know when they're done!
        </p>
      </StatusBarLayout>
    );
  }
}