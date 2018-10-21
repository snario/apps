import { gameReducer, MessageState } from '../reducer';
import { Player, positions } from '../../../core';
import * as actions from '../actions';
import * as state from '../state';

export const itSends = (position, jointState) => {
  it(`sends ${position.name}`, () => {
    expect(jointState.messageState.opponentOutbox).toEqual(position);
  });
};

export const itTransitionsTo = (stateName, jointState) => {
  it(`transitions to ${stateName}`, () => {
    expect(jointState.gameState.name).toEqual(stateName);
  });
};

export const itStoresAction = (action, jointState) => {
  it(`stores action to retry`, () => {
    expect(jointState.messageState.actionToRetry).toEqual(action);
  });
};

export const itHandlesResignLikeItsTheirTurn = (gameState: state.GameState, messageState: MessageState) => {
  describe('when the player resigns', () => {
    const updatedState = gameReducer({ gameState, messageState }, actions.resign());

    itTransitionsTo(state.StateName.WaitToResign, updatedState);
  });
};

export const itHandlesResignLikeItsMyTurn = (gameState: state.GameState, messageState: MessageState) => {
  describe('when the player resigns', () => {
    const { turnNum } = gameState;
    const updatedState = gameReducer({ gameState, messageState }, actions.resign());

    const newConclude = positions.conclude({ ...gameState, turnNum: turnNum + 1 });

    itTransitionsTo(state.StateName.WaitForResignationAcknowledgement, updatedState);
    itSends(newConclude, updatedState);
  });
};

export const itCanHandleTheOpponentResigning = ({ gameState, messageState }) => {
  const { turnNum } = gameState;
  const isTheirTurn = gameState.player === Player.PlayerA ? turnNum % 2 === 0 : turnNum % 2 !== 0;
  const newTurnNum = isTheirTurn ? turnNum : turnNum + 1;

  const theirConclude = positions.conclude({ ...gameState, turnNum: newTurnNum });
  const ourConclude = positions.conclude({ ...gameState, turnNum: newTurnNum + 1 });
  const action = actions.positionReceived(theirConclude);

  const updatedState = gameReducer({ gameState, messageState }, action);

  itTransitionsTo(state.StateName.OpponentResigned, updatedState);
  itSends(ourConclude, updatedState);
};
