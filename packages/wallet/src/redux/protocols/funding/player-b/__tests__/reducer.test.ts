import * as scenarios from './scenarios';
import * as states from '../states';
import { fundingReducer as reducer } from '../reducer';
import { ProtocolStateWithSharedData } from '../../..';
import { itSendsThisMessage } from '../../../../__tests__/helpers';
import { strategyApproved } from '../../player-a/actions';
import { messageRelayRequested } from 'magmo-wallet-client';

function whenIn(state) {
  return `when in ${state}`;
}

describe('happyPath', () => {
  const scenario = scenarios.happyPath;
  const sharedData = scenario.sharedData;

  describe(whenIn(states.WAIT_FOR_STRATEGY_PROPOSAL), () => {
    const state = scenario.states.waitForStrategyProposal;
    const action = scenario.actions.strategyProposed;
    const result = reducer(state, sharedData, action);

    itTransitionsTo(result, states.WAIT_FOR_STRATEGY_APPROVAL);
  });

  describe(whenIn(states.WAIT_FOR_STRATEGY_APPROVAL), () => {
    const state = scenario.states.waitForStrategyApproval;
    const action = scenario.actions.strategyApproved;
    const result = reducer(state, sharedData, action);

    itTransitionsTo(result, states.WAIT_FOR_FUNDING);

    const { processId, opponentAddress } = scenario;
    const sentAction = strategyApproved(processId);
    itSendsThisMessage(
      result,
      messageRelayRequested(opponentAddress, { processId, data: { sentAction } }),
    );
  });

  describe(whenIn(states.WAIT_FOR_FUNDING), () => {
    // TODO: This test depends on updating the indirect funding protocol
    // const state = scenario.states.waitForFunding;
    // const action = scenario.actions.indirectFundingSuccess;
    // const result = reducer(state, sharedData, action);
    // itTransitionsTo(result, states.WAIT_FOR_SUCCESS_CONFIRMATION);
  });

  describe(whenIn(states.WAIT_FOR_SUCCESS_CONFIRMATION), () => {
    const state = scenario.states.waitForSuccessConfirmation;
    const action = scenario.actions.successConfirmed;
    const result = reducer(state, sharedData, action);

    itTransitionsTo(result, states.SUCCESS);
  });
});

describe('When a strategy is rejected', () => {
  const scenario = scenarios.rejectedStrategy;
  const sharedData = scenario.sharedData;

  describe(whenIn(states.WAIT_FOR_STRATEGY_APPROVAL), () => {
    const state = scenario.states.waitForStrategyApproval;
    const action = scenario.actions.strategyRejected;
    const result = reducer(state, sharedData, action);

    itTransitionsTo(result, states.WAIT_FOR_STRATEGY_PROPOSAL);
  });
});

describe('when cancelled by the opponent', () => {
  const scenario = scenarios.cancelledByOpponent;
  const sharedData = scenario.sharedData;

  describe(whenIn(states.WAIT_FOR_STRATEGY_PROPOSAL), () => {
    const state = scenario.states.waitForStrategyProposal;
    const action = scenario.actions.cancelledByA;
    const result = reducer(state, sharedData, action);

    itTransitionsTo(result, states.FAILURE);
    itSendsThisMessage(result, 'WALLET.FUNDING.FAILURE');
  });

  describe(whenIn(states.WAIT_FOR_STRATEGY_APPROVAL), () => {
    const state = scenario.states.waitForStrategyApproval;
    const action = scenario.actions.cancelledByA;
    const result = reducer(state, sharedData, action);

    itTransitionsTo(result, states.FAILURE);
    itSendsThisMessage(result, 'WALLET.FUNDING.FAILURE');
  });
});

describe('when cancelled by the user', () => {
  const scenario = scenarios.cancelledByUser;
  const sharedData = scenario.sharedData;

  describe(whenIn(states.WAIT_FOR_STRATEGY_PROPOSAL), () => {
    const state = scenario.states.waitForStrategyProposal;
    const action = scenario.actions.cancelledByB;
    const result = reducer(state, sharedData, action);

    itTransitionsTo(result, states.FAILURE);
    itSendsThisMessage(result, 'WALLET.FUNDING.FAILURE');
  });

  describe(whenIn(states.WAIT_FOR_STRATEGY_APPROVAL), () => {
    const state = scenario.states.waitForStrategyApproval;
    const action = scenario.actions.cancelledByB;
    const result = reducer(state, sharedData, action);

    itTransitionsTo(result, states.FAILURE);
    itSendsThisMessage(result, 'WALLET.FUNDING.FAILURE');
  });
});

function itTransitionsTo(result: ProtocolStateWithSharedData<states.FundingState>, type: string) {
  it(`transitions to ${type}`, () => {
    expect(result.protocolState.type).toEqual(type);
  });
}