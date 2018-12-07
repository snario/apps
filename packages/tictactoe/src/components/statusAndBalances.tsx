import React from 'react';
import Status from './status'
import { Player, Marker } from '../core';

interface Props {
  stateType: string;
  balances: [String, String];
  player: Player;
  you: Marker;
}

export default class statusAndBalances extends React.PureComponent<Props> {
  renderYourBalance(balances: [String, String], player: Player) {
    if (player == Player.PlayerA){
      return <span>{balances[0]}</span>;
    }
    if (player == Player.PlayerB){
      return <span>{balances[1]}</span>;
    } else return;
  }
  renderTheirBalance(balances: [String, String], player: Player) {
    if (player == Player.PlayerA){
      return <span>{balances[1]}</span>;
    }
    if (player == Player.PlayerB){
      return <span>{balances[0]}</span>;
    } else return;
  }

  render() {
    const { balances, player, you } = this.props;
    return (<h1 className="full-width-bar" ><Status stateType="blah" you={you}/>&nbsp;[You]&nbsp;
      <span>
        {this.renderYourBalance(balances, player)}
      </span>&nbsp;| 
      <span>
      &nbsp;{this.renderTheirBalance(balances, player)}
      </span>
      &nbsp;[Them]
      </h1>

    );
  }
}