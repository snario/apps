import { directFundingStatusReducer } from '../reducer';

import * as states from '../state';
import * as depositingStates from '../depositing/state';
import * as actions from '../../../actions';

import * as scenarios from '../../../__tests__/test-scenarios';
import {
  itChangesChannelFundingStatusTo,
  itChangesDepositStatusTo,
} from '../../../__tests__/helpers';
import { addHex } from '../../../../utils/hex-utils';

const { channelId, twoThree } = scenarios;

const YOUR_DEPOSIT_A = twoThree[1];
const YOUR_DEPOSIT_B = twoThree[0];
const TOTAL_REQUIRED = twoThree.reduce(addHex);

const defaultsForA: states.DirectFundingStatus = {
  fundingType: states.DIRECT_FUNDING,
  requestedTotalFunds: TOTAL_REQUIRED,
  requestedYourContribution: YOUR_DEPOSIT_A,
  channelId,
  ourIndex: 0,
  safeToDepositLevel: '0x',
  channelFundingStatus: states.NOT_SAFE_TO_DEPOSIT,
};

const defaultsForB: states.DirectFundingStatus = {
  ...defaultsForA,
  requestedYourContribution: YOUR_DEPOSIT_B,
  ourIndex: 1,
  safeToDepositLevel: YOUR_DEPOSIT_A,
};

const startingIn = stage => `start in ${stage}`;
const whenActionArrives = action => `incoming action ${action}`;

describe(startingIn('any state'), () => {
  describe(whenActionArrives(actions.funding.FUNDING_RECEIVED_EVENT), () => {
    describe("When it's for the correct channel", () => {
      describe('when the channel is now funded', () => {
        const state = states.notSafeToDeposit(defaultsForA);
        const action = actions.funding.fundingReceivedEvent(
          channelId,
          TOTAL_REQUIRED,
          TOTAL_REQUIRED,
        );
        const updatedState = directFundingStatusReducer(state, action);
        itChangesChannelFundingStatusTo(states.CHANNEL_FUNDED, updatedState);
      });
      describe('when the channel is still not funded', () => {
        const state = states.notSafeToDeposit(defaultsForB);
        const action = actions.funding.fundingReceivedEvent(
          channelId,
          YOUR_DEPOSIT_B,
          YOUR_DEPOSIT_B,
        );
        const updatedState = directFundingStatusReducer(state, action);
        itChangesChannelFundingStatusTo(states.NOT_SAFE_TO_DEPOSIT, updatedState);
      });
    });

    describe("When it's for another channels", () => {
      const state = states.notSafeToDeposit(defaultsForA);
      const action = actions.funding.fundingReceivedEvent('0xf00', TOTAL_REQUIRED, TOTAL_REQUIRED);
      const updatedState = directFundingStatusReducer(state, action);
      itChangesChannelFundingStatusTo(states.NOT_SAFE_TO_DEPOSIT, updatedState);
    });
  });
});

describe(startingIn(states.NOT_SAFE_TO_DEPOSIT), () => {
  // player B scenario
  describe(whenActionArrives(actions.funding.FUNDING_RECEIVED_EVENT), () => {
    describe('when it is now safe to deposit', () => {
      const state = states.notSafeToDeposit(defaultsForB);
      const action = actions.funding.fundingReceivedEvent(
        channelId,
        YOUR_DEPOSIT_A,
        YOUR_DEPOSIT_A,
      );
      const updatedState = directFundingStatusReducer(state, action);

      itChangesChannelFundingStatusTo(states.SAFE_TO_DEPOSIT, updatedState);
      itChangesDepositStatusTo(depositingStates.WAIT_FOR_TRANSACTION_SENT, updatedState);
    });

    describe('when it is still not safe to deposit', () => {
      const state = states.notSafeToDeposit(defaultsForB);
      const action = actions.funding.fundingReceivedEvent(channelId, '0x', '0x');
      const updatedState = directFundingStatusReducer(state, action);

      itChangesChannelFundingStatusTo(states.NOT_SAFE_TO_DEPOSIT, updatedState);
    });
  });
});

describe(startingIn(states.SAFE_TO_DEPOSIT), () => {
  describe(whenActionArrives(actions.funding.FUNDING_RECEIVED_EVENT), () => {
    describe('when it is now fully funded', () => {
      const state = states.waitForFundingConfirmed(defaultsForB);
      const action = actions.funding.fundingReceivedEvent(
        channelId,
        YOUR_DEPOSIT_B,
        TOTAL_REQUIRED,
      );
      const updatedState = directFundingStatusReducer(state, action);

      itChangesChannelFundingStatusTo(states.CHANNEL_FUNDED, updatedState);
    });

    describe('when it is still not fully funded', () => {
      const state = states.waitForFundingConfirmed(defaultsForB);
      const action = actions.funding.fundingReceivedEvent(channelId, '0x', YOUR_DEPOSIT_A);
      const updatedState = directFundingStatusReducer(state, action);

      itChangesChannelFundingStatusTo(states.SAFE_TO_DEPOSIT, updatedState);
    });

    describe('when it is for the wrong channel', () => {
      const state = states.waitForFundingConfirmed(defaultsForB);
      const action = actions.funding.fundingReceivedEvent('0xf00', TOTAL_REQUIRED, TOTAL_REQUIRED);
      const updatedState = directFundingStatusReducer(state, action);

      itChangesChannelFundingStatusTo(states.SAFE_TO_DEPOSIT, updatedState);
    });
  });
});

describe(startingIn(states.CHANNEL_FUNDED), () => {
  it.skip('works', () => {
    expect.assertions(1);
  });
});