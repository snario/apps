import * as scenarios from './scenarios';
import { concludingReducer, initialize, ReturnVal } from '../reducer';
import { ConcludingStateType, FailureReason } from '../states';
import { expectThisCommitmentSent } from '../../../../__tests__/helpers';

describe('[ Happy path ]', () => {
  const scenario = scenarios.happyPath;
  const { channelId, processId, storage } = scenario;

  describe('when initializing', () => {
    const result = initialize(channelId, processId, storage);

    itTransitionsTo(result, 'ResponderApproveConcluding');
  });
  describe('when in ApproveConcluding', () => {
    const state = scenario.states.approveConcluding;
    const action = scenario.actions.concludeSent;
    const result = concludingReducer(state, storage, action);

    expectThisCommitmentSent(result.storage, scenario.commitments.concludeCommitment);
    itTransitionsTo(result, 'ResponderDecideDefund');
  });

  describe('when in DecideDefund', () => {
    const state = scenario.states.decideDefund;
    const action = scenario.actions.defundChosen;
    const result = concludingReducer(state, storage, action);

    itTransitionsTo(result, 'ResponderWaitForDefund');
  });

  describe('when in WaitForDefund', () => {
    const state = scenario.states.waitForDefund;
    const action = scenario.actions.successTrigger;
    const result = concludingReducer(state, storage, action);

    itTransitionsTo(result, 'ResponderAcknowledgeSuccess');
  });

  describe('when in AcknowledgeSuccess', () => {
    const state = scenario.states.acknowledgeSuccess;
    const action = scenario.actions.acknowledged;
    const result = concludingReducer(state, storage, action);

    itTransitionsTo(result, 'ResponderSuccess');
  });
});

describe('[ Channel doesnt exist ]', () => {
  const scenario = scenarios.channelDoesntExist;
  const { processId, storage } = scenario;

  describe('when initializing', () => {
    const result = initialize('NotInitializedChannelId', processId, storage);

    itTransitionsToAcknowledgeFailure(result, 'ChannelDoesntExist');
  });

  describe('when in AcknowledgeFailure', () => {
    const state = scenario.states.acknowledgeFailure;
    const action = scenario.actions.acknowledged;
    const result = concludingReducer(state, storage, action);

    itTransitionsToFailure(result, 'ChannelDoesntExist');
  });
});

describe('[ Concluding Not Possible ]', () => {
  const scenario = scenarios.concludingNotPossible;
  const { channelId, processId, storage } = scenario;

  describe('when initializing', () => {
    const result = initialize(channelId, processId, storage);

    itTransitionsToAcknowledgeFailure(result, 'NotYourTurn');
  });

  describe('when in AcknowledgeFailure', () => {
    const state = scenario.states.acknowledgeFailure;
    const action = scenario.actions.acknowledged;
    const result = concludingReducer(state, storage, action);

    itTransitionsToFailure(result, 'NotYourTurn');
  });
});

describe('[ Defunding Failed ]', () => {
  const scenario = scenarios.defundingFailed;
  const { storage } = scenario;

  describe('when in WaitForDefund', () => {
    const state = scenario.states.waitForDefund2;
    const action = scenario.actions.failureTrigger;
    const result = concludingReducer(state, storage, action);

    itTransitionsToAcknowledgeFailure(result, 'DefundFailed');
  });

  describe('when in AcknowledgeFailure', () => {
    const state = scenario.states.acknowledgeFailure;
    const action = scenario.actions.acknowledged;
    const result = concludingReducer(state, storage, action);

    itTransitionsToFailure(result, 'DefundFailed');
  });
});

function itTransitionsTo(result: ReturnVal, type: ConcludingStateType) {
  it(`transitions to ${type}`, () => {
    expect(result.state.type).toEqual(type);
  });
}

function itTransitionsToFailure(result: ReturnVal, reason: FailureReason) {
  it(`transitions to Failure with reason ${reason}`, () => {
    expect(result.state.type).toEqual('Failure');
    if (result.state.type === 'ResponderFailure') {
      expect(result.state.reason).toEqual(reason);
    }
  });
}

function itTransitionsToAcknowledgeFailure(result: ReturnVal, reason: FailureReason) {
  it(`transitions to AcknowledgeFailure with reason ${reason}`, () => {
    expect(result.state.type).toEqual('AcknowledgeFailure');
    if (result.state.type === 'ResponderAcknowledgeFailure') {
      expect(result.state.reason).toEqual(reason);
    }
  });
}
