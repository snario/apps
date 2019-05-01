import { bigNumberify } from 'ethers/utils';
import * as globalActions from '../../../../actions';
import {
  aWaitForPreFundSetup1,
  aWaitForDirectFunding,
  aWaitForLedgerUpdate1,
  aWaitForPostFundSetup1,
} from '../state';
import { channelFromCommitments } from '../../../../channel-store/channel-state/__tests__';
import { EMPTY_SHARED_DATA, setChannels } from '../../../../state';

import {
  preSuccessStateB,
  preFailureState,
  failureTrigger,
  successTriggerA,
  preSuccessStateA,
} from '../../../direct-funding/__tests__';
import {
  appCommitment,
  ledgerCommitment,
  asAddress,
  bsAddress,
  asPrivateKey,
  ledgerId,
  channelId,
} from '../../../../../domain/commitments/__tests__';

// -----------
// Commitments
// -----------
const processId = 'processId';

const twoThree = [
  { address: asAddress, wei: bigNumberify(2).toHexString() },
  { address: bsAddress, wei: bigNumberify(3).toHexString() },
];

const fiveToApp = [{ address: channelId, wei: bigNumberify(5).toHexString() }];

const app0 = appCommitment({ turnNum: 0, balances: twoThree });
const app1 = appCommitment({ turnNum: 1, balances: twoThree });
const app2 = appCommitment({ turnNum: 2, balances: twoThree });
const app3 = appCommitment({ turnNum: 3, balances: twoThree });

const ledger0 = ledgerCommitment({ turnNum: 0, balances: twoThree });
const ledger1 = ledgerCommitment({ turnNum: 1, balances: twoThree });
const ledger2 = ledgerCommitment({ turnNum: 2, balances: twoThree });
const ledger3 = ledgerCommitment({ turnNum: 3, balances: twoThree });
const ledger4 = ledgerCommitment({ turnNum: 4, balances: twoThree, proposedBalances: fiveToApp });
const ledger5 = ledgerCommitment({ turnNum: 5, balances: fiveToApp });

// Channels

const props = { channelId, ledgerId };

// ------
// States
// ------
const waitForPreFundL1 = {
  state: aWaitForPreFundSetup1(props),
  store: setChannels(EMPTY_SHARED_DATA, [
    channelFromCommitments(app0, app1, asAddress, asPrivateKey),
    channelFromCommitments(undefined, ledger0, asAddress, asPrivateKey),
  ]),
};
const waitForDirectFunding = {
  state: aWaitForDirectFunding({ ...props, directFundingState: preSuccessStateA.protocolState }), //
  store: setChannels(preSuccessStateB.sharedData, [
    channelFromCommitments(app1, app2, asAddress, asPrivateKey),
    channelFromCommitments(ledger2, ledger3, asAddress, asPrivateKey),
  ]),
};
const waitForLedgerUpdate1 = {
  state: aWaitForLedgerUpdate1(props),
  store: setChannels(EMPTY_SHARED_DATA, [
    channelFromCommitments(app0, app1, asAddress, asPrivateKey),
    channelFromCommitments(ledger3, ledger4, asAddress, asPrivateKey),
  ]),
};
const waitForPostFund1 = {
  state: aWaitForPostFundSetup1(props),
  store: setChannels(EMPTY_SHARED_DATA, [
    channelFromCommitments(app0, app1, asAddress, asPrivateKey),
    channelFromCommitments(ledger4, ledger5, asAddress, asPrivateKey),
  ]),
};

const waitForDirectFundingFailure = {
  state: aWaitForDirectFunding({ ...props, directFundingState: preFailureState.protocolState }), //
  store: setChannels(preFailureState.sharedData, [
    channelFromCommitments(app0, app1, asAddress, asPrivateKey),
    channelFromCommitments(ledger0, ledger1, asAddress, asPrivateKey),
  ]),
};

// -------
// Actions
// -------
const preFundL1Received = globalActions.commitmentReceived(processId, ledger1);
const ledgerUpdate1Received = globalActions.commitmentReceived(processId, ledger5);
const postFund1Received = globalActions.commitmentReceived(processId, app3);

export const happyPath = {
  initialParams: { store: waitForPreFundL1.store, channelId, reply: ledger0 },
  waitForPreFundL1: { state: waitForPreFundL1, action: preFundL1Received },
  waitForDirectFunding: { state: waitForDirectFunding, action: successTriggerA, reply: ledger4 },
  waitForLedgerUpdate1: {
    state: waitForLedgerUpdate1,
    action: ledgerUpdate1Received,
    reply: app2,
  },
  waitForPostFund1: { state: waitForPostFund1, action: postFund1Received },
};

export const ledgerFundingFails = {
  waitForDirectFunding: { state: waitForDirectFundingFailure, action: failureTrigger },
};