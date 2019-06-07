import * as scenarios from './scenarios';
import { challengerReducer, initialize } from '../reducer';
import {
  FailureReason,
  ChallengerStateType,
  WaitForTransaction,
  WaitForResponseOrTimeout,
  ChallengerState,
} from '../states';
import { itStoresThisCommitment, describeScenarioStep } from '../../../../__tests__/helpers';

const itTransitionsTo = (result: { protocolState: ChallengerState }, type: ChallengerStateType) => {
  it(`transitions to ${type}`, () => {
    expect(result.protocolState.type).toEqual(type);
  });
};

const itHasFailureReason = (result: { protocolState: ChallengerState }, reason: FailureReason) => {
  it(`has failure reason ${reason}`, () => {
    if ('reason' in result.protocolState) {
      expect(result.protocolState.reason).toEqual(reason);
    } else {
      fail(`State ${result.protocolState.type} doesn't have a failure reason.`);
    }
  });
};

describe('OPPONENT RESPONDS', () => {
  const scenario = scenarios.opponentResponds;
  const { channelId, processId, sharedData } = scenario;
  sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior
  describe('when initializing', () => {
    const result = initialize(channelId, processId, sharedData);
    // itSendsThisDisplayEventType(result.sharedData, SHOW_WALLET);
    // TODO it does not show wallet?

    itTransitionsTo(result, 'Challenging.ApproveChallenge');
  });
  describeScenarioStep(scenario.approveChallenge, () => {
    const { state, action } = scenario.approveChallenge;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.WaitForTransaction');
    // it initializes the transaction state machine
  });
  describeScenarioStep(scenario.waitForTransaction, () => {
    const { state, action2 } = scenario.waitForTransaction;
    const result = challengerReducer(state, sharedData, action2);

    itTransitionsTo(result, 'Challenging.WaitForTransaction');
    it('updates the expiry time', () => {
      expect((result.protocolState as WaitForTransaction).expiryTime).toEqual(action2.expiryTime);
    });
  });
  describeScenarioStep(scenario.waitForTransaction, () => {
    const { state, action } = scenario.waitForTransaction;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.WaitForResponseOrTimeout');
  });

  describeScenarioStep(scenario.waitForResponseOrTimeout1, () => {
    const { state, action } = scenario.waitForResponseOrTimeout1;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.WaitForResponseOrTimeout');
    it('updates the expiry time', () => {
      expect((result.protocolState as WaitForResponseOrTimeout).expiryTime).toEqual(
        action.expiryTime,
      );
    });
  });
  describeScenarioStep(scenario.waitForResponseOrTimeout2, () => {
    const { state, action, commitment } = scenario.waitForResponseOrTimeout2;
    const result = challengerReducer(state, sharedData, action);

    // itSendsThisMessage(result.sharedData, CHALLENGE_COMMITMENT_RECEIVED);
    // TODO don't send a message to the app?
    itStoresThisCommitment(result.sharedData, commitment);
    itTransitionsTo(result, 'Challenging.AcknowledgeResponse');
  });

  describeScenarioStep(scenario.acknowledgeResponse, () => {
    const { state, action } = scenario.acknowledgeResponse;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.SuccessOpen');

    // itSendsThisMessage(result.sharedData, CHALLENGE_COMPLETE);
    // itSendsThisDisplayEventType(result.sharedData, HIDE_WALLET);
    // TODO don't hide wallet
    // TODO it yieldsToProcess
  });
});

describe('CHALLENGE TIMES OUT AND IS DEFUNDED ', () => {
  const scenario = scenarios.challengeTimesOutAndIsDefunded;
  const { sharedData } = scenario;
  sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior

  describeScenarioStep(scenario.waitForResponseOrTimeout, () => {
    const { state, action } = scenario.waitForResponseOrTimeout;
    const result = challengerReducer(state, sharedData, action);
    itTransitionsTo(result, 'Challenging.AcknowledgeTimeout');
  });

  describeScenarioStep(scenario.acknowledgeTimeout, () => {
    const { state, action } = scenario.acknowledgeTimeout;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.WaitForDefund');
  });

  describeScenarioStep(scenario.challengerWaitForDefund, () => {
    const { state, action } = scenario.challengerWaitForDefund;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.AcknowledgeSuccess');
  });

  describeScenarioStep(scenario.acknowledgeSuccess, () => {
    const { state, action } = scenario.acknowledgeSuccess;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.SuccessClosedAndDefunded');
  });
});

describe('CHALLENGE TIMES OUT AND IS not DEFUNDED ', () => {
  const scenario = scenarios.challengeTimesOutAndIsNotDefunded;
  const { sharedData } = scenario;
  sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior

  describeScenarioStep(scenario.challengerWaitForDefund, () => {
    const { state, action } = scenario.challengerWaitForDefund;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.AcknowledgeClosedButNotDefunded');
  });

  describeScenarioStep(scenario.acknowledgeClosedButNotDefunded, () => {
    const { state, action } = scenario.acknowledgeClosedButNotDefunded;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.SuccessClosedButNotDefunded');
  });
});

describe('CHANNEL DOESNT EXIST  ', () => {
  const scenario = scenarios.channelDoesntExist;
  const { channelId, processId, sharedData } = scenario;
  sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior

  describe('when initializing', () => {
    const result = initialize(channelId, processId, sharedData);

    itTransitionsTo(result, 'Challenging.AcknowledgeFailure');
    itHasFailureReason(result, 'ChannelDoesntExist');
  });

  describeScenarioStep(scenario.acknowledgeFailure, () => {
    const { state, action } = scenario.acknowledgeFailure;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.Failure');
    itHasFailureReason(result, 'ChannelDoesntExist');
  });
});

describe('CHANNEL NOT FULLY OPEN  ', () => {
  const scenario = scenarios.channelNotFullyOpen;
  const { channelId, processId, sharedData } = scenario;
  sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior

  describe('when initializing', () => {
    const result = initialize(channelId, processId, sharedData);

    itTransitionsTo(result, 'Challenging.AcknowledgeFailure');
    itHasFailureReason(result, 'NotFullyOpen');
  });

  describeScenarioStep(scenario.acknowledgeFailure, () => {
    const { state, action } = scenario.acknowledgeFailure;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.Failure');
    itHasFailureReason(result, 'NotFullyOpen');
  });
});

describe('ALREADY HAVE LATEST COMMITMENT', () => {
  const scenario = scenarios.alreadyHaveLatest;
  const { channelId, processId, sharedData } = scenario;
  sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior

  describe('when initializing', () => {
    const result = initialize(channelId, processId, sharedData);

    itTransitionsTo(result, 'Challenging.AcknowledgeFailure');
    itHasFailureReason(result, 'AlreadyHaveLatest');
  });

  describeScenarioStep(scenario.acknowledgeFailure, () => {
    const { state, action } = scenario.acknowledgeFailure;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.Failure');
    itHasFailureReason(result, 'AlreadyHaveLatest');
  });
});

describe('USER DECLINES CHALLENGE  ', () => {
  const scenario = scenarios.userDeclinesChallenge;
  const { sharedData } = scenario;
  sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior

  describeScenarioStep(scenario.approveChallenge, () => {
    const { state, action } = scenario.approveChallenge;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.AcknowledgeFailure');
    itHasFailureReason(result, 'DeclinedByUser');
  });
  describeScenarioStep(scenario.acknowledgeFailure, () => {
    const { state, action } = scenario.acknowledgeFailure;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.Failure');
    itHasFailureReason(result, 'DeclinedByUser');
  });
});

describe('RECEIVE COMMITMENT WHILE APPROVING  ', () => {
  const scenario = scenarios.receiveCommitmentWhileApproving;
  const { sharedData } = scenario;
  sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior

  describeScenarioStep(scenario.approveChallenge, () => {
    const { state, action } = scenario.approveChallenge;
    // note: we're triggering this off the user's acceptance, not the arrival of the update
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.AcknowledgeFailure');
    itHasFailureReason(result, 'LatestWhileApproving');
  });

  describeScenarioStep(scenario.acknowledgeFailure, () => {
    const { state, action } = scenario.acknowledgeFailure;

    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.Failure');
    itHasFailureReason(result, 'LatestWhileApproving');
  });
});

describe('TRANSACTION FAILS  ', () => {
  const scenario = scenarios.transactionFails;
  const { sharedData } = scenario;
  sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior

  describeScenarioStep(scenario.waitForTransaction, () => {
    const { state, action } = scenario.waitForTransaction;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.AcknowledgeFailure');
    itHasFailureReason(result, 'TransactionFailed');
  });

  describeScenarioStep(scenario.acknowledgeFailure, () => {
    const { state, action } = scenario.acknowledgeFailure;
    const result = challengerReducer(state, sharedData, action);

    itTransitionsTo(result, 'Challenging.Failure');
    itHasFailureReason(result, 'TransactionFailed');
  });
});

describe('DEFUND ACTION arrives in ACKNOWLEDGE_TIMEOUT', () => {
  const scenario = scenarios.defundActionComesDuringAcknowledgeTimeout;

  describeScenarioStep(scenario.acknowledgeTimeout, () => {
    const { state, sharedData, action } = scenario.acknowledgeTimeout;
    sharedData.yieldingProcessId = 'Concluding-0xsomechannelid'; // will trigger ledger dispute behavior

    const result = challengerReducer(state, sharedData, action);
    // TODO: Is this the correct state?
    itTransitionsTo(result, 'Challenging.AcknowledgeClosedButNotDefunded');
  });
});