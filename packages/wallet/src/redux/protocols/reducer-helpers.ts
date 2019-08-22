import { SIGNATURE_SUCCESS, VALIDATION_SUCCESS, fundingSuccess } from 'magmo-wallet-client';
import * as actions from '../actions';
import { channelStoreReducer } from '../channel-store/reducer';
import { accumulateSideEffects } from '../outbox';
import { SideEffects } from '../outbox/state';
import { SharedData, queueMessage, getExistingChannel, checkAndStore } from '../state';
import * as selectors from '../selectors';
import { TwoPartyPlayerIndex, ThreePartyPlayerIndex } from '../types';
import { CommitmentType } from 'fmg-core/lib/commitment';
import * as magmoWalletClient from 'magmo-wallet-client';
import { getLastCommitment, nextParticipant, Commitments } from '../channel-store';
import { Commitment } from '../../domain';
import { sendCommitmentsReceived, ProtocolLocator } from '../../communication';
import * as comms from '../../communication';
import { ourTurn as ourTurnOnChannel } from '../channel-store';
import { CONSENSUS_LIBRARY_ADDRESS, HUB_ADDRESS } from '../../constants';
import { addHex } from '../../utils/hex-utils';
import _ from 'lodash';
import { bigNumberify } from 'ethers/utils';

export const updateChannelState = (
  sharedData: SharedData,
  channelAction: actions.channel.ChannelAction,
): SharedData => {
  const newSharedData = { ...sharedData };
  const updatedChannelState = channelStoreReducer(newSharedData.channelStore, channelAction);
  newSharedData.channelStore = updatedChannelState.state;
  // TODO: Currently we need to filter out signature/validation messages that are meant to the app
  // This might change based on whether protocol reducers or channel reducers craft commitments
  const filteredSideEffects = filterOutSignatureMessages(updatedChannelState.sideEffects);
  // App channel state may still generate side effects
  newSharedData.outboxState = accumulateSideEffects(newSharedData.outboxState, filteredSideEffects);
  return newSharedData;
};

export const filterOutSignatureMessages = (sideEffects?: SideEffects): SideEffects | undefined => {
  if (sideEffects && sideEffects.messageOutbox) {
    let messageArray = Array.isArray(sideEffects.messageOutbox)
      ? sideEffects.messageOutbox
      : [sideEffects.messageOutbox];
    messageArray = messageArray.filter(
      walletEvent =>
        walletEvent.type !== VALIDATION_SUCCESS && walletEvent.type !== SIGNATURE_SUCCESS,
    );
    return {
      ...sideEffects,
      messageOutbox: messageArray,
    };
  }
  return sideEffects;
};

export function sendFundingComplete(sharedData: SharedData, appChannelId: string) {
  const channelState = selectors.getOpenedChannelState(sharedData, appChannelId);
  const c = getLastCommitment(channelState);
  if (c.commitmentType !== CommitmentType.PostFundSetup || c.turnNum !== 3) {
    throw new Error(
      `Expected a post fund setup B commitment. Instead received ${JSON.stringify(c)}.`,
    );
  }
  return queueMessage(sharedData, fundingSuccess(appChannelId, c));
}

export function showWallet(sharedData: SharedData): SharedData {
  const newSharedData = { ...sharedData };
  newSharedData.outboxState = accumulateSideEffects(newSharedData.outboxState, {
    displayOutbox: magmoWalletClient.showWallet(),
  });
  return newSharedData;
}

export function hideWallet(sharedData: SharedData): SharedData {
  const newSharedData = { ...sharedData };
  newSharedData.outboxState = accumulateSideEffects(newSharedData.outboxState, {
    displayOutbox: magmoWalletClient.hideWallet(),
  });
  return newSharedData;
}

export function sendConcludeSuccess(sharedData: SharedData): SharedData {
  const newSharedData = { ...sharedData };
  newSharedData.outboxState = accumulateSideEffects(newSharedData.outboxState, {
    messageOutbox: magmoWalletClient.concludeSuccess(),
    // TODO could rename this helper function, as it covers both ways of finalizing a channel
  });
  return newSharedData;
}

export function sendConcludeInstigated(sharedData: SharedData, channelId: string): SharedData {
  const channel = getExistingChannel(sharedData, channelId);
  const { participants, ourIndex } = channel;
  const messageRelay = comms.sendConcludeInstigated(
    nextParticipant(participants, ourIndex),
    channelId,
  );
  return queueMessage(sharedData, messageRelay);
}

export function sendOpponentConcluded(sharedData: SharedData): SharedData {
  const newSharedData = { ...sharedData };
  newSharedData.outboxState = accumulateSideEffects(newSharedData.outboxState, {
    messageOutbox: magmoWalletClient.opponentConcluded(),
    // TODO could rename this helper function, as it covers both ways of finalizing a channel
  });
  return newSharedData;
}

export function sendCommitments(
  sharedData: SharedData,
  processId: string,
  channelId: string,
  protocolLocator: ProtocolLocator,
): SharedData {
  const channel = getExistingChannel(sharedData, channelId);
  const { participants, ourIndex } = channel;
  const messageRelay = sendCommitmentsReceived(
    nextParticipant(participants, ourIndex),
    processId,
    channel.commitments,
    protocolLocator,
  );
  return queueMessage(sharedData, messageRelay);
}

export function checkCommitments(
  sharedData: SharedData,
  turnNum: number,
  commitments: Commitments,
): SharedData {
  // We don't bother checking "stale" commitments -- those whose turnNum does not
  // exceed the current turnNum.

  commitments
    .filter(signedCommitment => signedCommitment.commitment.turnNum > turnNum)
    .map(signedCommitment => {
      const result = checkAndStore(sharedData, signedCommitment);
      if (result.isSuccess) {
        sharedData = result.store;
      } else {
        throw new Error('Unable to validate commitment');
      }
    });

  return sharedData;
}

export function sendChallengeResponseRequested(
  sharedData: SharedData,
  channelId: string,
): SharedData {
  const newSharedData = { ...sharedData };
  newSharedData.outboxState = accumulateSideEffects(newSharedData.outboxState, {
    messageOutbox: magmoWalletClient.challengeResponseRequested(channelId),
  });
  return newSharedData;
}

export function sendChallengeCommitmentReceived(sharedData: SharedData, commitment: Commitment) {
  const newSharedData = { ...sharedData };
  newSharedData.outboxState = accumulateSideEffects(newSharedData.outboxState, {
    messageOutbox: magmoWalletClient.challengeCommitmentReceived(commitment),
  });
  return newSharedData;
}

// TODO 'Complete' here means the challenge was successfully responded to
export function sendChallengeComplete(sharedData: SharedData) {
  const newSharedData = { ...sharedData };
  newSharedData.outboxState = accumulateSideEffects(newSharedData.outboxState, {
    messageOutbox: magmoWalletClient.challengeComplete(),
  });
  return newSharedData;
}

export function sendConcludeFailure(
  sharedData: SharedData,
  reason: 'Other' | 'UserDeclined',
): SharedData {
  const newSharedData = { ...sharedData };
  newSharedData.outboxState = accumulateSideEffects(newSharedData.outboxState, {
    messageOutbox: magmoWalletClient.concludeFailure(reason),
  });
  return newSharedData;
}

export const channelIsClosed = (channelId: string, sharedData: SharedData): boolean => {
  return (
    channelHasConclusionProof(channelId, sharedData) ||
    channelFinalizedOnChain(channelId, sharedData)
  );
};

export const channelFundsAnotherChannel = (channelId: string, sharedData: SharedData): boolean => {
  const latestCommitment = getLatestCommitment(channelId, sharedData);
  return (
    _.intersection(selectors.getChannelIds(sharedData), latestCommitment.destination).length > 0
  );
};

export const channelHasConclusionProof = (channelId: string, sharedData: SharedData): boolean => {
  const channelState = selectors.getOpenedChannelState(sharedData, channelId);
  const [penultimateCommitment, lastCommitment] = channelState.commitments;
  return (
    lastCommitment.commitment.commitmentType === CommitmentType.Conclude &&
    penultimateCommitment.commitment.commitmentType === CommitmentType.Conclude
  );
};

export const channelFinalizedOnChain = (channelId: string, sharedData: SharedData): boolean => {
  const channelState = selectors.getAdjudicatorChannelState(sharedData, channelId);
  return channelState && channelState.finalized;
};

export enum FundingType {
  Virtual,
  Ledger,
  Direct,
}
export const getChannelFundingType = (channelId: string, sharedData: SharedData): FundingType => {
  const channelFundingState = selectors.getChannelFundingState(sharedData, channelId);
  if (!channelFundingState) {
    throw new Error(`No funding state for ${channelId}. Cannot determine funding type.`);
  }
  if (channelFundingState.directlyFunded) {
    return FundingType.Direct;
  }
  if (!channelFundingState.fundingChannel) {
    throw new Error(`Channel ${channelId} is not directly funded but has not fundingChannelId`);
  }
  const channelState = getExistingChannel(sharedData, channelFundingState.fundingChannel);
  return channelState.participants.length === 3 ? FundingType.Virtual : FundingType.Ledger;
};

export const getTwoPlayerIndex = (
  channelId: string,
  sharedData: SharedData,
): TwoPartyPlayerIndex => {
  const channelState = selectors.getChannelState(sharedData, channelId);
  return channelState.participants.indexOf(channelState.address);
};
export const isFirstPlayer = (channelId: string, sharedData: SharedData) => {
  const channelState = selectors.getChannelState(sharedData, channelId);
  return channelState.ourIndex === TwoPartyPlayerIndex.A;
};

export const isLastPlayer = (channelId: string, sharedData: SharedData) => {
  const channelState = selectors.getChannelState(sharedData, channelId);
  return channelState.ourIndex === channelState.participants.length - 1;
};

export function isSafeToSend({
  sharedData,
  channelId,
  ourIndex,
  clearedToSend,
}: {
  sharedData: SharedData;
  ourIndex: TwoPartyPlayerIndex | ThreePartyPlayerIndex;
  channelId?: string;
  clearedToSend: boolean;
}): boolean {
  if (!clearedToSend) {
    return false;
  }

  // The possibilities are:
  // A. The channel is not in storage and our index is 0.
  // B. The channel is not in storage and our index is not 0.
  // C. The channel is in storage and it's our turn
  // D. The channel is in storage and it's not our turn

  if (!channelId) {
    return ourIndex === 0;
  }

  const channel = selectors.getChannelState(sharedData, channelId);
  const numParticipants = channel.participants.length;
  return (channel.turnNum + 1) % numParticipants === ourIndex;
}

export function isTwoPlayerChannel(channelId: string, sharedData: SharedData): boolean {
  const { participants } = selectors.getChannelState(sharedData, channelId);
  return participants.length === 2;
}

export function getOurOpenApplicationChannels(sharedData: SharedData): string[] {
  const channelIds = selectors.getChannelIds(sharedData);
  return channelIds.filter(channelId => {
    const channel = selectors.getChannelState(sharedData, channelId);
    const ourAddress = getOurAddress(channelId, sharedData);

    return (
      channel.libraryAddress !== CONSENSUS_LIBRARY_ADDRESS &&
      channel.participants.indexOf(ourAddress) > -1 &&
      !isChannelConcluded(channelId, sharedData) &&
      channel.participants.length === 2 &&
      !isGuarantorChannel(channelId, sharedData)
    );
  });
}
export function getOurOpenHubChannels(sharedData: SharedData): string[] {
  const channelIds = selectors.getChannelIds(sharedData);
  return channelIds.filter(channelId => {
    const channel = selectors.getChannelState(sharedData, channelId);
    const ourAddress = getOurAddress(channelId, sharedData);

    return (
      channel.libraryAddress === CONSENSUS_LIBRARY_ADDRESS &&
      channel.participants.length === 2 &&
      channel.participants.indexOf(ourAddress) > -1 &&
      channel.participants.indexOf(HUB_ADDRESS) > -1 &&
      !isChannelConcluded(channelId, sharedData) &&
      !isGuarantorChannel(channelId, sharedData)
    );
  });
}

export function isGuarantorChannel(channelId: string, sharedData: SharedData): boolean {
  const latestCommitment = getLatestCommitment(channelId, sharedData);
  return !!latestCommitment.channel.guaranteedChannel;
}

export function isChannelConcluded(channelId: string, sharedData: SharedData): boolean {
  const { participants } = selectors.getChannelState(sharedData, channelId);
  const latestCommitment = getLatestCommitment(channelId, sharedData);
  return (
    latestCommitment.commitmentType === CommitmentType.Conclude &&
    latestCommitment.commitmentCount === participants.length - 1
  );
}

export function getAllocationTotal(channelId: string, sharedData: SharedData): string {
  const { allocation } = getLatestCommitment(channelId, sharedData);
  return allocation.reduce(addHex, '0x0');
}

export function getOurAllocation(channelId: string, sharedData: SharedData): string {
  const ourAddress = getOurAddress(channelId, sharedData);
  const { allocation, destination } = getLatestCommitment(channelId, sharedData);
  const ourIndex = destination.indexOf(ourAddress);
  return allocation[ourIndex];
}

export function getOpponentAllocation(channelId: string, sharedData: SharedData): string {
  const opponentAddress = getOpponentAddress(channelId, sharedData);
  const { allocation, destination } = getLatestCommitment(channelId, sharedData);
  const opponentIndex = destination.indexOf(opponentAddress);
  return allocation[opponentIndex];
}

export function getOpponentAddress(channelId: string, sharedData: SharedData) {
  const channel = getExistingChannel(sharedData, channelId);

  const { participants } = channel;
  if (participants.length > 2) {
    throw new Error('getOpponentAddress only supports two player channels');
  }
  const opponentAddress = participants[(channel.ourIndex + 1) % participants.length];
  return opponentAddress;
}

export function getOurAddress(channelId: string, sharedData: SharedData) {
  const channel = getExistingChannel(sharedData, channelId);
  return channel.participants[channel.ourIndex];
}

export function getLatestCommitment(channelId: string, sharedData: SharedData) {
  const channel = getExistingChannel(sharedData, channelId);
  return getLastCommitment(channel);
}

export function getNumberOfParticipants(commitment: Commitment): number {
  return commitment.channel.participants.length;
}

export function ourTurn(sharedData: SharedData, channelId: string) {
  const channel = getExistingChannel(sharedData, channelId);
  return ourTurnOnChannel(channel);
}

export function getTargetOfLedgerFunding(
  ledgerChannelId: string,
  sharedData: SharedData,
): string | undefined {
  const latestCommitment = getLatestCommitment(ledgerChannelId, sharedData);
  // We assume there is only one channel listed in the destination
  return latestCommitment.destination.find(d => {
    const targetFundingState = selectors.getChannelFundingState(sharedData, d);
    // Ensure that the funding state reflects what we have in the commitment destination
    return !targetFundingState || targetFundingState.fundingChannel !== ledgerChannelId;
  });
}

export function getFundingChannelId(channelId: string, sharedData: SharedData): string {
  const fundingState = selectors.getChannelFundingState(sharedData, channelId);
  if (!fundingState) {
    throw new Error(`No funding state found for ${channelId}`);
  }
  if (fundingState.directlyFunded) {
    return channelId;
  } else {
    const channelIdToCheck = !!fundingState.fundingChannel
      ? fundingState.fundingChannel
      : fundingState.guarantorChannel;
    if (!channelIdToCheck) {
      throw new Error(
        `Funding state for ${channelId} is not directly funded so it must have a funding or guarantor channel`,
      );
    }

    return getFundingChannelId(channelIdToCheck, sharedData);
  }
}

export function removeZeroFundsFromBalance(
  incomingAllocation: string[],
  incomingDestination: string[],
): { allocation: string[]; destination: string[] } {
  const allocation: string[] = [];
  const destination: string[] = [];
  incomingAllocation.map((a, i) => {
    if (bigNumberify(a).gt(0)) {
      allocation.push(incomingAllocation[i]);
      destination.push(incomingDestination[i]);
    }
  });
  return { allocation, destination };
}
