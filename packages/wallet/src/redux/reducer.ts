import * as states from './state';

import * as actions from './actions';
import { unreachable } from '../utils/reducer-utils';
import { initializedReducer } from './initialized/reducer';
import { clearOutbox } from './outbox/reducer';
import { accumulateSideEffects } from './outbox';
import { initializationSuccess } from 'magmo-wallet-client/lib/wallet-events';

const initialState = states.waitForLogin();

export const walletReducer = (
  state: states.WalletState = initialState,
  action: actions.WalletAction,
): states.WalletState => {
  const nextState = { ...state, outboxState: clearOutbox(state.outboxState, action) };

  switch (nextState.stage) {
    case states.INITIALIZING:
      return initializingReducer(nextState, action);
    case states.WALLET_INITIALIZED:
      return initializedReducer(nextState, action);
    default:
      return unreachable(nextState);
  }
};

export const initializingReducer = (
  state: states.InitializingState,
  action: actions.WalletAction,
): states.WalletState => {
  switch (state.type) {
    case states.WAIT_FOR_LOGIN:
      return waitForLoginReducer(state, action);
    case states.WAIT_FOR_ADJUDICATOR:
      return waitForAdjudicatorReducer(state, action);
    case states.METAMASK_ERROR:
      // We stay in the metamask error state until a change to
      // metamask settings forces a refresh
      return state;
    default:
      return unreachable(state);
  }
};

const waitForLoginReducer = (state: states.WaitForLogin, action: actions.WalletAction): states.InitializingState => {
  switch (action.type) {
    case actions.LOGGED_IN:
      return states.waitForAdjudicator({ ...state, uid: action.uid });
    default:
      return state;
  }
};

const waitForAdjudicatorReducer = (
  state: states.WaitForAdjudicator,
  action: any,
): states.WalletState => {
  switch (action.type) {
    case actions.ADJUDICATOR_KNOWN:
      const { adjudicator, networkId } = action;
      return states.initialized({
        ...state,
        outboxState: accumulateSideEffects(state.outboxState, {
          messageOutbox: [initializationSuccess()],
        }),
        adjudicator,
        networkId,
      });
    default:
      return state;
  }
};

