import {
  ledgerCommitment,
  asAddress,
  bsAddress,
  asPrivateKey,
  ledgerId,
  channelId,
  appCommitment,
} from '../../../../domain/commitments/__tests__';
import { bigNumberify } from 'ethers/utils';
import { channelFromCommitments } from '../../../channel-store/channel-state/__tests__';
import { EMPTY_SHARED_DATA, setChannels } from '../../../state';
import * as states from '../states';
import { preSuccess as existingLedgerPreSuccess } from '../../existing-ledger-funding/__tests__';
import {
  preSuccessState as newLedgerPreSuccess,
  successTrigger as NewLedgerChannelSuccessTrigger,
} from '../../new-ledger-channel/__tests__';

const processId = 'processId';

const oneThree = [
  { address: asAddress, wei: bigNumberify(1).toHexString() },
  { address: bsAddress, wei: bigNumberify(3).toHexString() },
];
const props = {
  ledgerId,
  channelId,
  processId,
  targetAllocation: oneThree.map(o => o.wei),
  targetDestination: oneThree.map(o => o.address),
};
const ledger4 = ledgerCommitment({ turnNum: 4, balances: oneThree });
const ledger5 = ledgerCommitment({ turnNum: 5, balances: oneThree });
const app0 = appCommitment({ turnNum: 0, balances: oneThree });
const app1 = appCommitment({ turnNum: 1, balances: oneThree });
const existingLedgerFundingSharedData = setChannels(existingLedgerPreSuccess.sharedData, [
  channelFromCommitments([ledger4, ledger5], asAddress, asPrivateKey),
  channelFromCommitments([app0, app1], asAddress, asPrivateKey),
]);
const NewLedgerChannelSharedData = setChannels(EMPTY_SHARED_DATA, [
  channelFromCommitments([app0, app1], asAddress, asPrivateKey),
]);
const waitForExistingLedgerFunding = states.waitForExistingLedgerFunding({
  ...props,
  existingLedgerFundingState: existingLedgerPreSuccess.state,
});
const waitForNewLedgerChannel = states.waitForNewLedgerChannel({
  ...props,
  newLedgerChannel: newLedgerPreSuccess.state,
});

export const existingLedgerFundingHappyPath = {
  initialize: { ...props, sharedData: existingLedgerFundingSharedData },
};

export const newLedgerChannelHappyPath = {
  initialize: { ...props, sharedData: NewLedgerChannelSharedData },
  waitForNewLedgerChannel: {
    state: waitForNewLedgerChannel,
    action: NewLedgerChannelSuccessTrigger,
    sharedData: newLedgerPreSuccess.sharedData,
  },
  waitForExistingLedgerFunding: {
    state: waitForExistingLedgerFunding,
    action: existingLedgerPreSuccess.action,
    sharedData: existingLedgerPreSuccess.sharedData,
  },
};
