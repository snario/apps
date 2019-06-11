import * as states from './states';
import {
  InstigatorConcludingState as CState,
  InstigatorNonTerminalState as NonTerminalCState,
  instigatorApproveConcluding,
  instigatorWaitForOpponentConclude,
  instigatorWaitForDefund,
  instigatorAcknowledgeSuccess,
  instigatorAcknowledgeFailure,
  instigatorAcknowledgeConcludeReceived,
} from './states';
import { unreachable } from '../../../../utils/reducer-utils';
import {
  SharedData,
  getChannel,
  setChannelStore,
  queueMessage,
  checkAndStore,
} from '../../../state';
import { composeConcludeCommitment } from '../../../../utils/commitment-utils';
import { ourTurn } from '../../../channel-store';
import { DefundingAction, isDefundingAction } from '../../defunding/actions';
import { initialize as initializeDefunding, defundingReducer } from '../../defunding/reducer';
import { isSuccess, isFailure, waitForLedgerDefunding } from '../../defunding/states';
import * as channelStoreReducer from '../../../channel-store/reducer';
import * as selectors from '../../../selectors';
import {
  showWallet,
  sendConcludeSuccess,
  hideWallet,
  sendConcludeFailure,
} from '../../reducer-helpers';
import { ProtocolAction } from '../../../../redux/actions';
import { theirAddress } from '../../../channel-store';
import { sendConcludeInstigated, CommitmentReceived } from '../../../../communication';
import { failure, success } from '../states';
import { getChannelId, CommitmentType } from '../../../../domain';
import { ProtocolStateWithSharedData } from '../..';
import { isConcludingInstigatorAction } from './actions';
import { confirmLedgerUpdate, waitForLedgerUpdate } from '../../indirect-defunding/states';
import { indirectDefundingReducer } from '../../indirect-defunding/reducer';
import { CONSENSUS_LIBRARY_ADDRESS } from '../../../../constants';

export type ReturnVal = ProtocolStateWithSharedData<states.InstigatorConcludingState>;
export type Storage = SharedData;

export function instigatorConcludingReducer(
  protocolState: NonTerminalCState,
  sharedData: SharedData,
  action: ProtocolAction,
): ReturnVal {
  // TODO: Since a commitment received could be a defundingAction OR
  // a concludingAction we need to check if its the action we're interested in
  // This is a bit awkward, probably a better way of handling this?
  if (action.type === 'WALLET.COMMON.COMMITMENT_RECEIVED') {
    const channelId = getChannelId(action.signedCommitment.commitment);
    if (channelId === protocolState.channelId) {
      return concludeReceived(action, protocolState, sharedData);
    }
  }
  if (isDefundingAction(action)) {
    return handleDefundingAction(protocolState, sharedData, action);
  }

  if (!isConcludingInstigatorAction(action)) {
    return { protocolState, sharedData };
  }

  switch (action.type) {
    case 'WALLET.CONCLUDING.INSTIGATOR.CONCLUDING_CANCELLED':
      return concludingCancelled(protocolState, sharedData);
    case 'WALLET.CONCLUDING.INSTIGATOR.CONCLUDE_APPROVED':
      return concludeApproved(protocolState, sharedData);
    case 'WALLET.CONCLUDING.INSTIGATOR.DEFUND_CHOSEN':
      return defundChosen(protocolState, sharedData);
    case 'WALLET.CONCLUDING.INSTIGATOR.ACKNOWLEDGED':
      return acknowledged(protocolState, sharedData);
    default:
      return unreachable(action);
  }
}

export function initialize(channelId: string, processId: string, sharedData: Storage): ReturnVal {
  const channelState = getChannel(sharedData, channelId);
  if (!channelState) {
    return {
      protocolState: instigatorAcknowledgeFailure({
        processId,
        channelId,
        reason: 'ChannelDoesntExist',
      }),
      sharedData,
    };
  }
  if (ourTurn(channelState)) {
    // if it's our turn now, we may resign
    return {
      protocolState: instigatorApproveConcluding({ channelId, processId }),
      sharedData: showWallet(sharedData),
    };
  } else {
    return {
      protocolState: instigatorAcknowledgeFailure({ channelId, processId, reason: 'NotYourTurn' }),
      sharedData,
    };
  }
}

function handleDefundingAction(
  protocolState: NonTerminalCState,
  sharedData: Storage,
  action: DefundingAction,
): ReturnVal {
  if (
    protocolState.type === 'ConcludingInstigator.AcknowledgeConcludeReceived' &&
    action.type === 'WALLET.COMMON.LEDGER_DISPUTE_DETECTED' &&
    sharedData.fundingState[protocolState.channelId].fundingChannel
  ) {
    // setup preaction FS with sub-IDFS, call IDF reducer with this action
    const { processId } = action;
    const channel = getChannel(sharedData, protocolState.channelId);
    if (!channel) {
      throw new Error(`Channel does not exist with id ${protocolState.channelId}`);
    }
    const preActionIndirectDefundingState = confirmLedgerUpdate({
      processId,
      ledgerId:
        sharedData.fundingState[protocolState.channelId].fundingChannel || 'No Funding channel',
      channelId: protocolState.channelId,
      proposedAllocation: channel.lastCommitment.commitment.allocation,
      proposedDestination: channel.lastCommitment.commitment.destination,
      commitmentType: CommitmentType.App,
      isRespondingToChallenge: true,
    });
    const postActionIndirectDefundingState = indirectDefundingReducer(
      preActionIndirectDefundingState,
      sharedData,
      action,
    );
    const postActionDefundingState = waitForLedgerDefunding({
      processId,
      channelId: protocolState.channelId,
      indirectDefundingState: postActionIndirectDefundingState.protocolState,
    });
    const postActionConcludingState = instigatorWaitForDefund({
      processId,
      channelId: protocolState.channelId,
      defundingState: postActionDefundingState,
    });
    return {
      protocolState: postActionConcludingState,
      sharedData: postActionIndirectDefundingState.sharedData,
    };
  }
  if (
    protocolState.type === 'ConcludingInstigator.AcknowledgeConcludeReceived' &&
    action.type === 'WALLET.COMMON.COMMITMENT_RECEIVED' &&
    action.signedCommitment.commitment.channel.channelType === CONSENSUS_LIBRARY_ADDRESS
  ) {
    // setup preaction FS with sub-IDFS, call IDF reducer with this action
    const { processId } = action;
    const channel = getChannel(sharedData, protocolState.channelId);
    if (!channel) {
      throw new Error(`Channel does not exist with id ${protocolState.channelId}`);
    }
    const preActionIndirectDefundingState = waitForLedgerUpdate({
      processId,
      ledgerId: getChannelId(action.signedCommitment.commitment),
      channelId: protocolState.channelId,
      proposedAllocation: channel.lastCommitment.commitment.allocation,
      proposedDestination: channel.lastCommitment.commitment.destination,
      commitmentType: CommitmentType.App,
    });
    const postActionIndirectDefundingState = indirectDefundingReducer(
      preActionIndirectDefundingState,
      sharedData,
      action,
    );
    const postActionDefundingState = waitForLedgerDefunding({
      processId,
      channelId: protocolState.channelId,
      indirectDefundingState: postActionIndirectDefundingState.protocolState,
    });
    const postActionConcludingState = instigatorWaitForDefund({
      processId,
      channelId: protocolState.channelId,
      defundingState: postActionDefundingState,
    });
    return {
      protocolState: postActionConcludingState,
      sharedData: postActionIndirectDefundingState.sharedData,
    };
  }
  if (protocolState.type !== 'ConcludingInstigator.WaitForDefund') {
    return { protocolState, sharedData };
  }
  const defundingState1 = protocolState.defundingState;

  const protocolStateWithSharedData = defundingReducer(defundingState1, sharedData, action);
  const updatedDefundingState = protocolStateWithSharedData.protocolState;
  sharedData = protocolStateWithSharedData.sharedData;
  if (isSuccess(updatedDefundingState)) {
    protocolState = instigatorAcknowledgeSuccess(protocolState);
  } else if (isFailure(updatedDefundingState)) {
    protocolState = instigatorAcknowledgeFailure({ ...protocolState, reason: 'DefundFailed' });
  } else {
    protocolState = { ...protocolState, defundingState: updatedDefundingState };
  }
  return { protocolState, sharedData };
}

function concludingCancelled(protocolState: NonTerminalCState, sharedData: Storage): ReturnVal {
  if (protocolState.type !== 'ConcludingInstigator.ApproveConcluding') {
    return { protocolState, sharedData };
  }
  return {
    protocolState: failure({ reason: 'ConcludeCancelled' }),
    sharedData: hideWallet(sharedData),
  };
}

function concludeApproved(protocolState: NonTerminalCState, sharedData: Storage): ReturnVal {
  if (protocolState.type !== 'ConcludingInstigator.ApproveConcluding') {
    return { protocolState, sharedData };
  }

  const channelState = getChannel(sharedData, protocolState.channelId);

  if (channelState) {
    const sharedDataWithOwnCommitment = createAndSendConcludeCommitment(
      sharedData,
      protocolState.channelId,
    );

    return {
      protocolState: instigatorWaitForOpponentConclude({ ...protocolState }),
      sharedData: sharedDataWithOwnCommitment,
    };
  } else {
    return { protocolState, sharedData };
  }
}

function concludeReceived(
  action: CommitmentReceived,
  protocolState: NonTerminalCState,
  sharedData: Storage,
): ReturnVal {
  if (protocolState.type !== 'ConcludingInstigator.WaitForOpponentConclude') {
    return { protocolState, sharedData };
  }
  const { signedCommitment } = action;
  const checkResult = checkAndStore(sharedData, signedCommitment);
  if (!checkResult.isSuccess) {
    throw new Error('Concluding instigator protocol, unable to validate or store commitment');
  }
  const updatedStorage = checkResult.store;

  return {
    protocolState: instigatorAcknowledgeConcludeReceived(protocolState),
    sharedData: updatedStorage,
  };
}

function defundChosen(protocolState: NonTerminalCState, sharedData: Storage): ReturnVal {
  if (protocolState.type !== 'ConcludingInstigator.AcknowledgeConcludeReceived') {
    return { protocolState, sharedData };
  }
  // initialize defunding state machine

  const protocolStateWithSharedData = initializeDefunding(
    protocolState.processId,
    protocolState.channelId,
    sharedData,
  );
  const defundingState = protocolStateWithSharedData.protocolState;
  sharedData = protocolStateWithSharedData.sharedData;
  return {
    protocolState: instigatorWaitForDefund({ ...protocolState, defundingState }),
    sharedData,
  };
}

function acknowledged(protocolState: CState, sharedData: Storage): ReturnVal {
  switch (protocolState.type) {
    case 'ConcludingInstigator.AcknowledgeSuccess':
      return {
        protocolState: success({}),
        sharedData: sendConcludeSuccess(hideWallet(sharedData)),
      };
    case 'ConcludingInstigator.AcknowledgeFailure':
      return {
        protocolState: failure({ reason: protocolState.reason }),
        sharedData: sendConcludeFailure(hideWallet(sharedData), 'Other'),
      };
    default:
      return { protocolState, sharedData };
  }
}

// Helpers

const createAndSendConcludeCommitment = (sharedData: SharedData, channelId: string): SharedData => {
  const channelState = selectors.getOpenedChannelState(sharedData, channelId);

  const commitment = composeConcludeCommitment(channelState);

  const signResult = channelStoreReducer.signAndStore(sharedData.channelStore, commitment);
  if (signResult.isSuccess) {
    const sharedDataWithOwnCommitment = setChannelStore(sharedData, signResult.store);
    const messageRelay = sendConcludeInstigated(
      theirAddress(channelState),
      channelId,
      signResult.signedCommitment,
    );
    return queueMessage(sharedDataWithOwnCommitment, messageRelay);
  } else {
    throw new Error(
      `Direct funding protocol, createAndSendPostFundCommitment, unable to sign commitment: ${
        signResult.reason
      }`,
    );
  }
};
