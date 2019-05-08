import {
  appCommitment,
  ledgerCommitment,
  asAddress,
  bsAddress,
  asPrivateKey,
  ledgerId,
  channelId,
} from '../../../../domain/commitments/__tests__';
import { bigNumberify } from 'ethers/utils/bignumber';
import { waitForLedgerUpdate } from '../state';
import { setChannels, EMPTY_SHARED_DATA } from '../../../state';
import { channelFromCommitments } from '../../../channel-store/channel-state/__tests__';
import { bsPrivateKey } from '../../../../communication/__tests__/commitments';
import * as globalActions from '../../../actions';
// -----------
// Commitments
// -----------
const processId = 'processId';

const twoThree = [
  { address: asAddress, wei: bigNumberify(2).toHexString() },
  { address: bsAddress, wei: bigNumberify(3).toHexString() },
];

const fiveToApp = [{ address: channelId, wei: bigNumberify(5).toHexString() }];

const props = {
  channelId,
  ledgerId,
  processId,
  proposedAllocation: twoThree.map(a => a.wei),
  proposedDestination: twoThree.map(a => a.address),
};

const app10 = appCommitment({ turnNum: 10, balances: twoThree, isFinal: true });
const app11 = appCommitment({ turnNum: 11, balances: twoThree, isFinal: true });

const ledger4 = ledgerCommitment({ turnNum: 4, balances: twoThree, proposedBalances: fiveToApp });
const ledger5 = ledgerCommitment({ turnNum: 5, balances: fiveToApp });
const ledger6 = ledgerCommitment({ turnNum: 6, balances: fiveToApp, proposedBalances: twoThree });
const ledger7 = ledgerCommitment({ turnNum: 7, balances: twoThree });

const initialStore = setChannels(EMPTY_SHARED_DATA, [
  channelFromCommitments(app10, app11, asAddress, asPrivateKey),
  channelFromCommitments(ledger4, ledger5, asAddress, asPrivateKey),
]);

const playerAWaitForLedgerUpdate = {
  state: waitForLedgerUpdate(props),
  store: setChannels(EMPTY_SHARED_DATA, [
    channelFromCommitments(app10, app11, asAddress, asPrivateKey),
    channelFromCommitments(ledger5, ledger6, asAddress, asPrivateKey),
  ]),
};

const playerBWaitForUpdate = {
  state: waitForLedgerUpdate(props),
  store: setChannels(EMPTY_SHARED_DATA, [
    channelFromCommitments(app10, app11, bsAddress, bsPrivateKey),
    channelFromCommitments(ledger4, ledger5, bsAddress, bsPrivateKey),
  ]),
};
const ledgerUpdate0Received = globalActions.commitmentReceived(processId, ledger6);
const ledgerUpdate1Received = globalActions.commitmentReceived(processId, ledger7);
export const playerAHappyPath = {
  initialParams: {
    store: initialStore,
    ...props,
    reply: ledger6,
  },
  waitForLedgerUpdate: { state: playerAWaitForLedgerUpdate, action: ledgerUpdate1Received },
};

export const playerBHappyPath = {
  initialParams: {
    store: initialStore,
    ...props,
  },
  waitForLedgerUpdate: {
    state: playerBWaitForUpdate,
    action: ledgerUpdate0Received,
    reply: ledger7,
  },
};
