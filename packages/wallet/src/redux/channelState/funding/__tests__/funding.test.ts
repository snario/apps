import { fundingReducer } from '../reducer';

import * as states from '../../state';
import * as actions from '../../../actions';

import * as scenarios from '../../../__tests__/test-scenarios';
import {
  itTransitionsToChannelStateType,
  itIncreasesTurnNumBy,
  itSendsThisMessage,
  expectThisCommitmentSent,
  itDispatchesThisAction,
  itDispatchesNoAction,
} from '../../../__tests__/helpers';
import * as outgoing from 'magmo-wallet-client/lib/wallet-events';
import * as SigningUtil from '../../../../utils/signing-utils';
import * as fmgCore from 'fmg-core';
import { addHex } from '../../../../utils/hex-utils';

const {
  asAddress,
  asPrivateKey,
  bsPrivateKey,
  channelNonce,
  libraryAddress,
  participants,
  preFundCommitment1,
  preFundCommitment2,
  postFundCommitment1,
  postFundCommitment2,
  channelId,
  twoThree,
} = scenarios;

const defaults = {
  address: asAddress,
  adjudicator: 'adj-address',
  channelId,
  channelNonce,
  libraryAddress,
  networkId: 3,
  participants,
  uid: 'uid',
  transactionHash: '0x0',
  funded: false,
};

const defaultsA = {
  ...defaults,
  ourIndex: 0,
  privateKey: asPrivateKey,
};

const defaultsB = {
  ...defaults,
  ourIndex: 1,
  privateKey: bsPrivateKey,
};

const justReceivedPreFundSetupB = {
  penultimateCommitment: { commitment: preFundCommitment1, signature: 'sig' },
  lastCommitment: { commitment: preFundCommitment2, signature: 'sig' },
  turnNum: 1,
};

const justReceivedPostFundSetupA = {
  penultimateCommitment: { commitment: preFundCommitment2, signature: 'sig' },
  lastCommitment: { commitment: postFundCommitment1, signature: 'sig' },
  turnNum: 2,
  funded: true,
};

const justReceivedPostFundSetupB = {
  penultimateCommitment: { commitment: postFundCommitment1, signature: 'sig' },
  lastCommitment: { commitment: postFundCommitment2, signature: 'sig' },
  turnNum: 3,
  funded: true,
};

const playerDefaults = {
  A: defaultsA,
  B: defaultsB,
};

describe('start in WaitForFundingRequest', () => {
  describe('action taken: funding requested', () => {
    // player A scenario
    const testDefaults = {
      ...defaultsA,
      ...justReceivedPreFundSetupB,
    };
    const state = states.waitForFundingRequest(testDefaults);
    const action = actions.fundingRequested();
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_FUNDING_APPROVAL, updatedState);
  });

  describe('action taken: funding requested', () => {
    // player B scenario
    const testDefaults = {
      ...defaultsB,
      ...justReceivedPreFundSetupB,
    };
    const state = states.waitForFundingRequest(testDefaults);
    const action = actions.fundingRequested();
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_FUNDING_APPROVAL, updatedState);
  });
});

describe('start in WaitForFundingApproval', () => {
  describe('incoming action: funding approved', () => {
    // player A scenario
    const testDefaults = { ...defaultsA, ...justReceivedPreFundSetupB };
    const state = states.approveFunding(testDefaults);
    const action = actions.fundingApproved();
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_FUNDING_AND_POST_FUND_SETUP, updatedState);
    itDispatchesThisAction(
      actions.internal.directFundingRequested(
        channelId,
        twoThree.reduce(addHex),
        '0x00',
        twoThree[0],
      ),
      updatedState,
    );
  });
  describe('incoming action: funding rejected', () => {
    const testDefaults = { ...defaultsA, ...justReceivedPreFundSetupB };
    const state = states.approveFunding(testDefaults);
    const action = actions.fundingRejected();
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.SEND_FUNDING_DECLINED_MESSAGE, updatedState);
    itDispatchesNoAction(updatedState);
  });

  describe('incoming action: Funding declined message received', () => {
    const testDefaults = { ...defaultsA, ...justReceivedPreFundSetupB };
    const state = states.approveFunding(testDefaults);
    const action = actions.messageReceived('FundingDeclined');
    const updatedState = fundingReducer(state, action);
    itTransitionsToChannelStateType(states.ACKNOWLEDGE_FUNDING_DECLINED, updatedState);
    itDispatchesNoAction(updatedState);
  });

  describe('incoming action: funding approved', () => {
    // player B scenario
    const testDefaults = { ...defaultsB, ...justReceivedPreFundSetupB };
    const state = states.approveFunding(testDefaults);
    const action = actions.fundingApproved();
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_FUNDING_AND_POST_FUND_SETUP, updatedState);
    itDispatchesThisAction(
      actions.internal.directFundingRequested(
        channelId,
        twoThree.reduce(addHex),
        twoThree[0],
        twoThree[1],
      ),
      updatedState,
    );
  });
});

describe('start in WaitForFundingAndPostFundSetup', () => {
  function startingState(player: 'A' | 'B') {
    const params = {
      ...playerDefaults[player],
      ...justReceivedPreFundSetupB,
    };
    return states.waitForFundingAndPostFundSetup(params);
  }

  describe('incoming action: Funding declined message received', () => {
    const state = startingState('A');
    const action = actions.messageReceived('FundingDeclined');
    const updatedState = fundingReducer(state, action);
    itTransitionsToChannelStateType(states.ACKNOWLEDGE_FUNDING_DECLINED, updatedState);
  });

  describe('incoming action: INTERNAL.DIRECT_FUNDING_CONFIRMED', () => {
    const state = startingState('A');
    const action = actions.internal.directFundingConfirmed(channelId);
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.A_WAIT_FOR_POST_FUND_SETUP, updatedState);
    itIncreasesTurnNumBy(1, state, updatedState);
  });

  describe('incoming action: message received', () => {
    const state = startingState('B');
    const validateMock = jest.fn().mockReturnValue(true);
    Object.defineProperty(SigningUtil, 'validCommitmentSignature', { value: validateMock });

    const action = actions.commitmentReceived(postFundCommitment1, '0x0');
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_FUNDING_CONFIRMATION, updatedState);
    itIncreasesTurnNumBy(2, state, updatedState);
  });

  describe('incoming action: INTERNAL.DIRECT_FUNDING_CONFIRMED', () => {
    const state = startingState('B');
    const action = actions.internal.directFundingConfirmed(channelId);
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.B_WAIT_FOR_POST_FUND_SETUP, updatedState);
  });
});

describe('start in WaitForFundingConfirmation', () => {});

describe('start in SendFundingDeclinedMessage', () => {
  describe('incoming action: message sent', () => {
    // player A scenario
    const testDefaults = { ...defaultsA, ...justReceivedPreFundSetupB };
    const state = states.sendFundingDeclinedMessage(testDefaults);
    const action = actions.messageSent();
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_CHANNEL, updatedState);
    itSendsThisMessage(updatedState, outgoing.FUNDING_FAILURE);
  });
});

describe('start in AWaitForPostFundSetup', () => {
  describe('incoming action: message received', () => {
    // player A scenario
    const validateMock = jest.fn().mockReturnValue(true);
    Object.defineProperty(SigningUtil, 'validCommitmentSignature', { value: validateMock });

    const testDefaults = { ...defaultsA, ...justReceivedPostFundSetupA };
    const state = states.aWaitForPostFundSetup({
      ...testDefaults,
    });
    const action = actions.commitmentReceived(postFundCommitment2, 'sig');
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.ACKNOWLEDGE_FUNDING_SUCCESS, updatedState);
    itIncreasesTurnNumBy(1, state, updatedState);
  });
});

describe('start in BWaitForPostFundSetup', () => {
  describe('incoming action: message received', () => {
    // player B scenario
    const testDefaults = { ...defaultsB, ...justReceivedPreFundSetupB };
    const state = states.bWaitForPostFundSetup(testDefaults);
    const validateMock = jest.fn().mockReturnValue(true);
    Object.defineProperty(SigningUtil, 'validSignature', { value: validateMock });
    const action = actions.commitmentReceived(postFundCommitment1, 'sig');
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.ACKNOWLEDGE_FUNDING_SUCCESS, updatedState);
    itIncreasesTurnNumBy(2, state, updatedState);
    itSendsThisMessage(updatedState, outgoing.COMMITMENT_RELAY_REQUESTED);
  });
});

describe('start in AcknowledgeFundingSuccess', () => {
  describe('incoming action: FundingSuccessAcknowledged', () => {
    // player A scenario
    const testDefaults = { ...defaultsA, ...justReceivedPostFundSetupB };
    const state = states.acknowledgeFundingSuccess(testDefaults);
    const action = actions.fundingSuccessAcknowledged();
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_UPDATE, updatedState);
    it('sends PostFundSetupB', () => {
      expectThisCommitmentSent(updatedState, {
        commitmentType: fmgCore.CommitmentType.PostFundSetup,
        commitmentCount: 1,
      });
    });
  });

  describe('incoming action: FundingSuccessAcknowledged', () => {
    // player B scenario
    const testDefaults = { ...defaultsB, ...justReceivedPostFundSetupB };
    const state = states.acknowledgeFundingSuccess(testDefaults);
    const action = actions.fundingSuccessAcknowledged();
    const updatedState = fundingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_UPDATE, updatedState);
    itSendsThisMessage(updatedState, outgoing.FUNDING_SUCCESS);
    it('sends PostFundSetupB', () => {
      expectThisCommitmentSent(updatedState, {
        commitmentType: fmgCore.CommitmentType.PostFundSetup,
        commitmentCount: 1,
      });
    });
  });
});
