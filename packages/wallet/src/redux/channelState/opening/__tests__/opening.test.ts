import * as states from '../../state';
import * as actions from '../../../actions';

import {
  itTransitionsToChannelStateType,
  itDoesntTransition,
  itSendsThisMessage,
} from '../../../__tests__/helpers';
import * as scenarios from '../../../__tests__/test-scenarios';
import * as SigningUtil from '../../../../utils/signing-utils';
import { validationFailure, SIGNATURE_FAILURE } from 'magmo-wallet-client';
import { openingReducer } from '../reducer';

const {
  asAddress,
  asPrivateKey,
  preFundCommitment1,
  preFundCommitment2,
  libraryAddress,
  bsAddress,
  bsPrivateKey,
  fundingState,
} = scenarios;

const defaults = {
  address: asAddress,
  privateKey: asPrivateKey,
  libraryAddress,
  fundingState,
};

describe('when in WaitForChannel', () => {
  describe('when initializeChannel is requested again', () => {
    it.skip('works', async () => {
      // TODO: What to do here?
      expect.assertions(1);
    });
    // const state = states.waitForChannel(defaultsdefaults);
    // const action = actions.loggedIn(defaults.uid);
    // const updatedState = openingReducer(state, action);
    // itTransitionsToStateType(states.WAIT_FOR_ADDRESS, updatedState);
  });

  describe('when we send in a PreFundSetupA', () => {
    // preFundSetupA is A's move, so in this case we need to be player A
    const state = states.waitForChannel(defaults);
    const action = actions.channel.ownCommitmentReceived(preFundCommitment1);
    const updatedState = openingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_PRE_FUND_SETUP, updatedState);
  });

  describe('when an opponent sends a PreFundSetupA', () => {
    // preFundSetupA is A's move, so in this case we need to be player B
    const state = states.waitForChannel({ address: bsAddress, privateKey: bsPrivateKey });
    const action = actions.channel.opponentCommitmentReceived(preFundCommitment1, 'sig');
    const validateMock = jest.fn().mockReturnValue(true);
    Object.defineProperty(SigningUtil, 'validCommitmentSignature', { value: validateMock });

    const updatedState = openingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_PRE_FUND_SETUP, updatedState);
  });

  describe('when an opponent sends a PreFundSetupA but the signature is bad', () => {
    const state = states.waitForChannel(defaults);
    const action = actions.channel.opponentCommitmentReceived(
      preFundCommitment1,
      'not-a-signature',
    );
    const validateMock = jest.fn().mockReturnValue(false);
    Object.defineProperty(SigningUtil, 'validCommitmentSignature', { value: validateMock });

    const updatedState = openingReducer(state, action);

    itDoesntTransition(state, updatedState);
    itSendsThisMessage(updatedState, validationFailure('InvalidSignature'));
  });

  describe('when we send in a a non-PreFundSetupA', () => {
    const state = states.waitForChannel(defaults);
    const action = actions.channel.ownCommitmentReceived(preFundCommitment2);
    const updatedState = openingReducer(state, action);

    itDoesntTransition(state, updatedState);
    itSendsThisMessage(updatedState, SIGNATURE_FAILURE);
  });
});

describe('when in WaitForPreFundSetup', () => {
  const defaults2 = {
    ...defaults,
    channelId: scenarios.channelId,
    channelNonce: scenarios.channelNonce,
    participants: scenarios.channel.participants as [string, string],
    turnNum: 0,
    lastCommitment: { commitment: preFundCommitment1, signature: 'fake-sig' },
    funded: false,
  };

  describe('when we send a PreFundSetupB', () => {
    // preFundSetupB is B's move, so in this case we need to be player B
    const state = states.waitForPreFundSetup({ ...defaults2, ourIndex: 1 });
    const action = actions.channel.ownCommitmentReceived(preFundCommitment2);
    const updatedState = openingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_FUNDING_REQUEST, updatedState);
  });

  describe('when an opponent sends a PreFundSetupB', () => {
    // preFundSetupB is B's move, so in this case we need to be player A
    const state = states.waitForPreFundSetup({ ...defaults2, ourIndex: 0 });
    const validateMock = jest.fn().mockReturnValue(true);
    Object.defineProperty(SigningUtil, 'validCommitmentSignature', { value: validateMock });

    const action = actions.channel.opponentCommitmentReceived(preFundCommitment2, 'sig');
    const updatedState = openingReducer(state, action);

    itTransitionsToChannelStateType(states.WAIT_FOR_FUNDING_REQUEST, updatedState);
  });

  describe('when an opponent sends a PreFundSetupB but the signature is bad', () => {
    const state = states.waitForPreFundSetup({ ...defaults2, ourIndex: 0 });
    const action = actions.channel.opponentCommitmentReceived(preFundCommitment2, 'sig');
    const validateMock = jest.fn().mockReturnValue(false);
    Object.defineProperty(SigningUtil, 'validCommitmentSignature', { value: validateMock });

    const updatedState = openingReducer(state, action);
    itDoesntTransition(state, updatedState);
    itSendsThisMessage(updatedState, validationFailure('InvalidSignature'));
  });

  describe('when we send in a a non-PreFundSetupB', () => {
    const state = states.waitForPreFundSetup({ ...defaults2, ourIndex: 1 });
    const action = actions.channel.ownCommitmentReceived(preFundCommitment1);
    const updatedState = openingReducer(state, action);

    itDoesntTransition(state, updatedState);
    itSendsThisMessage(updatedState, SIGNATURE_FAILURE);
  });
});