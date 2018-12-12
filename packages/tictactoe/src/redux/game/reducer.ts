import { Reducer } from 'redux';

import * as actions from './actions';
import * as states from './state';
import * as results from '../../core/results';

import { positions, Player, isDraw, isWinningMarks, Position } from '../../core';
import { MessageState, sendMessage } from '../message-service/state';

import hexToBN from '../../utils/hexToBN';
import bnToHex from '../../utils/bnToHex';


export interface JointState {
  gameState: states.GameState;
  messageState: MessageState;
}

const emptyJointState: JointState = { messageState: {}, gameState: states.noName({ myAddress: '', libraryAddress: '' }) };

export const gameReducer: Reducer<JointState> = (state = emptyJointState, action: actions.GameAction) => {
  state = singleActionReducer(state, action);
  return state;
};

function singleActionReducer(state: JointState, action: actions.GameAction) {
  const { messageState, gameState } = state;
  switch (gameState.name) {
    case states.StateName.XsPickMove:
      if (action.type === actions.XS_MOVE_CHOSEN) {
        return xsPickMoveReducer(gameState, messageState, action);
      } else { return state; }
    case states.StateName.OsPickMove:
      if (action.type === actions.OS_MOVE_CHOSEN) {
        return osPickMoveReducer(gameState, messageState, action);
      } else { return state; }
    case states.StateName.XsWaitForOpponentToPickMove:
      if (action.type === actions.MARKS_RECEIVED) {
        return xsWaitMoveReducer(gameState, messageState, action);
      } else { return state; }
    case states.StateName.OsWaitForOpponentToPickMove:
      if (action.type === actions.MARKS_RECEIVED) {
        return osWaitMoveReducer(gameState, messageState, action);
      } else { return state; }
    default:
      return state;
  }
}

function favorA(balances: [string, string], roundBuyIn): [string, string] {
  const aBal: string = bnToHex(hexToBN(balances[0]).add(hexToBN(roundBuyIn)));
  const bBal: string = bnToHex(hexToBN(balances[1]).sub(hexToBN(roundBuyIn)));
  return [aBal, bBal];
}

function favorB(balances: [string, string], roundBuyIn): [string, string] {
  const aBal: string = bnToHex(hexToBN(balances[0]).sub(hexToBN(roundBuyIn)));
  const bBal: string = bnToHex(hexToBN(balances[1]).add(hexToBN(roundBuyIn)));
  return [aBal, bBal];
}

function xsPickMoveReducer(gameState: states.XsPickMove, messageState: MessageState, action: actions.XsMoveChosen): JointState {
  const { player, balances, roundBuyIn, noughts, crosses, turnNum } = gameState;
  const newCrosses = crosses + action.crosses;
  let newBalances: [string, string] = balances;

  const opponentAddress = states.getOpponentAddress(gameState);
  let pos: Position = positions.draw({ ...gameState, crosses: newCrosses, balances: newBalances }); // default
  let newGameState: states.GameState = states.playAgain({ ...gameState, turnNum: turnNum + 1, crosses: newCrosses, result: results.Result.Tie }); // default

  // if draw
  if (isDraw(noughts, newCrosses)) {
    switch (player) {
      case Player.PlayerA: {
        newBalances = favorA(balances, roundBuyIn);
        break;
      }
      case Player.PlayerB: {
        newBalances = favorB(balances, roundBuyIn);
        break;
      }
    }
    newGameState = states.playAgain({ ...gameState, turnNum: turnNum + 1, crosses: newCrosses, result: results.Result.Tie });
    pos = positions.draw({ ...newGameState, crosses: newCrosses, balances: newBalances });
    messageState = sendMessage(pos, opponentAddress, messageState);
    return { gameState: newGameState, messageState };
  }

  // if not draw then full swing to current player, unless its the first turn in a round
  switch (player) {
    case Player.PlayerA: {
      if (noughts !== 0 && crosses !== 0) {
        newBalances = favorA(favorA(balances, roundBuyIn), roundBuyIn); // usually enact a full swing to current player
      } else {
        newBalances = favorA(balances, roundBuyIn); // if first move of a round, simply assign roundBuyIn to current player.
      }
      break;
    }
    case Player.PlayerB: {
      if (noughts !== 0 && crosses !== 0) {
        newBalances = favorB(favorB(balances, roundBuyIn), roundBuyIn);
      } else {
        newBalances = favorB(balances, roundBuyIn);
      }
      break;
    }
  }

  // if inconclusive
  if (!isDraw(noughts, newCrosses) && !isWinningMarks(newCrosses)) {
    newGameState = states.xsWaitForOpponentToPickMove({ ...gameState, turnNum: turnNum + 1, crosses: newCrosses });
    pos = positions.Xplaying({ ...newGameState, crosses: newCrosses, balances: newBalances });
  }

  // if winning move
  if (isWinningMarks(newCrosses)) {
    newGameState = states.playAgain({ ...gameState, turnNum: turnNum + 1, crosses: newCrosses, result: results.Result.YouWin });
    pos = positions.victory({ ...newGameState, crosses: newCrosses, balances: newBalances });
  }

  messageState = sendMessage(pos, opponentAddress, messageState);
  return { gameState: newGameState, messageState };
}

function osPickMoveReducer(gameState: states.OsPickMove, messageState: MessageState, action: actions.OsMoveChosen): JointState {
  const { player, balances, roundBuyIn, noughts, crosses, turnNum } = gameState;
  const newNoughts = noughts + action.noughts;
  let newBalances: [string, string] = balances;

  const opponentAddress = states.getOpponentAddress(gameState);
  let pos: Position = positions.draw({ ...gameState, noughts: newNoughts, balances: newBalances }); // default
  let newGameState: states.GameState = states.playAgain({ ...gameState, turnNum: turnNum + 1, noughts: newNoughts, result: results.Result.Tie }); // default

  // if draw
  if (isDraw(newNoughts, crosses)) {
    switch (player) {
      case Player.PlayerA: {
        newBalances = favorA(balances, roundBuyIn);
        break;
      }
      case Player.PlayerB: {
        newBalances = favorB(balances, roundBuyIn);
        break;
      }
    }
    newGameState = states.playAgain({ ...gameState, turnNum: turnNum + 1, noughts: newNoughts, result: results.Result.Tie });
    pos = positions.draw({ ...newGameState, noughts: newNoughts, balances: newBalances });
    messageState = sendMessage(pos, opponentAddress, messageState);
    return { gameState: newGameState, messageState };
  }

  // if not draw then full swing to current player, unless its the first turn in a round
  switch (player) {
    case Player.PlayerA: {
      if (noughts !== 0 && crosses !== 0) {
        newBalances = favorA(favorA(balances, roundBuyIn), roundBuyIn); // usually enact a full swing to current player
        console.log('full swing!');
      } else {
        newBalances = favorA(balances, roundBuyIn); // if first move of a round, simply assign roundBuyIn to current player.
        console.log('single swing!');
      }
      break;
    }
    case Player.PlayerB: {
      if (noughts > 0 || crosses > 0) {
        newBalances = favorB(favorB(balances, roundBuyIn), roundBuyIn);
      } else {
        console.log('first move of the round');
        newBalances = favorB(balances, roundBuyIn);
      }
      break;
    }
  }

  // if inconclusive
  if (!isDraw(newNoughts, crosses) && !isWinningMarks(newNoughts)) {
    newGameState = states.osWaitForOpponentToPickMove({ ...gameState, turnNum: turnNum + 1, noughts: newNoughts });
    pos = positions.Oplaying({ ...newGameState, noughts: newNoughts, balances: newBalances });
  }

  // if winning move
  if (isWinningMarks(newNoughts)) {
    newGameState = states.playAgain({ ...gameState, turnNum: turnNum + 1, noughts: newNoughts, result: results.Result.YouWin });
    pos = positions.victory({ ...newGameState, noughts: newNoughts, balances: newBalances });
  }

  messageState = sendMessage(pos, opponentAddress, messageState);
  return { gameState: newGameState, messageState };

}

function xsWaitMoveReducer(gameState: states.XsWaitForOpponentToPickMove, messageState: MessageState, action: actions.MarksReceived): JointState {
  const receivedNoughts = action.receivedMarks;
  const { noughts, crosses, balances, player, roundBuyIn, turnNum } = gameState;
  let newBalances: [string, string] = balances;

  switch (player) {
    case Player.PlayerB: {
      if (noughts !== 0 && crosses !== 0) {
        newBalances = favorA(favorA(balances, roundBuyIn), roundBuyIn); // usually enact a full swing to current player
        console.log('full swing!');
      } else {
        newBalances = favorA(balances, roundBuyIn); // if first move of a round, simply assign roundBuyIn to current player.
        console.log('single swing!');
      }
      break;
    }
    case Player.PlayerA: {
      if (noughts > 0 || crosses > 0) {
        newBalances = favorB(favorB(balances, roundBuyIn), roundBuyIn);
      } else {
        console.log('first move of the round');
        newBalances = favorB(balances, roundBuyIn);
      }
      break;
    }
  }

  let newGameState: states.XsPickMove | states.PlayAgain | states.InsufficientFunds
    = states.xsPickMove({ ...gameState, turnNum: turnNum + 0, noughts: receivedNoughts, balances: newBalances });

  if (!isWinningMarks(receivedNoughts) && !isDraw(receivedNoughts, crosses)) { // Not conclusive, keep playing
    // go with default case
  }

  // this should never happen!
  // if (!isWinningMarks(receivedNoughts) && isDraw(receivedNoughts,crosses)){ // Draw, play again?
  //   switch(player){
  //     case Player.PlayerB: {
  //       newBalances = favorA(balances, roundBuyIn); 
  //       break;
  //     }
  //     case Player.PlayerA: {
  //       newBalances = favorB(balances,roundBuyIn);
  //       break;
  //     }
  //   }
  //   newGameState = states.playAgain({...gameState, noughts: receivedNoughts, result: results.Result.Tie, balances: newBalances}); 
  // }

  if (isWinningMarks(receivedNoughts)) { // Lost, if sufficient $ play again?
    if ((player === Player.PlayerA && newBalances[0] > roundBuyIn) || (player === Player.PlayerB && newBalances[1] > roundBuyIn)) {
      newGameState = states.playAgain({ ...gameState, noughts: receivedNoughts, balances: newBalances, result: results.Result.YouLose });
    } else {
      newGameState = states.insufficientFunds({ ...gameState, noughts: receivedNoughts, balances: newBalances, result: results.Result.YouLose });
    }

  }
  return { gameState: newGameState, messageState };
}

function osWaitMoveReducer(gameState: states.OsWaitForOpponentToPickMove, messageState: MessageState, action: actions.MarksReceived): JointState {
  const receivedCrosses = action.receivedMarks;
  const { noughts, crosses, balances, player, roundBuyIn, turnNum } = gameState;
  let newBalances: [string, string] = balances;

  switch (player) {
    case Player.PlayerB: {
      if (noughts !== 0 && crosses !== 0) {
        newBalances = favorA(favorA(balances, roundBuyIn), roundBuyIn); // usually enact a full swing to current player
        console.log('full swing!');
      } else {
        newBalances = favorA(balances, roundBuyIn); // if first move of a round, simply assign roundBuyIn to current player.
        console.log('single swing!');
      }
      break;
    }
    case Player.PlayerA: {
      if (noughts > 0 || crosses > 0) {
        newBalances = favorB(favorB(balances, roundBuyIn), roundBuyIn);
      } else {
        console.log('first move of the round');
        newBalances = favorB(balances, roundBuyIn);
      }
      break;
    }
  }

  let newGameState: states.OsPickMove | states.PlayAgain | states.InsufficientFunds
    = states.osPickMove({ ...gameState, turnNum: turnNum + 0, crosses: receivedCrosses, balances: newBalances });

  if (!isWinningMarks(receivedCrosses) && !isDraw(noughts, receivedCrosses)) { // Not conclusive, keep playing
    // go with default case
  }

  if (!isWinningMarks(receivedCrosses) && isDraw(noughts, receivedCrosses)) { // Draw, play again?
    switch (player) {
      case Player.PlayerB: {
        newBalances = favorA(balances, roundBuyIn);
        break;
      }
      case Player.PlayerA: {
        newBalances = favorB(balances, roundBuyIn);
        break;
      }
    }
    newGameState = states.playAgain({ ...gameState, crosses: receivedCrosses, result: results.Result.Tie, balances: newBalances });
  }

  if (isWinningMarks(receivedCrosses)) { // Lost, if sufficient $ play again?
    if ((player === Player.PlayerA && newBalances[0] > roundBuyIn) || (player === Player.PlayerB && newBalances[1] > roundBuyIn)) {
      newGameState = states.playAgain({ ...gameState, crosses: receivedCrosses, balances: newBalances, result: results.Result.YouLose });
    } else {
      newGameState = states.insufficientFunds({ ...gameState, crosses: receivedCrosses, balances: newBalances, result: results.Result.YouLose });
    }

  }
  return { gameState: newGameState, messageState };
}
