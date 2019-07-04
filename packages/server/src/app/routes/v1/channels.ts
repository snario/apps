import * as koaBody from 'koa-body';
import * as Router from 'koa-router';

import { RelayableAction } from 'magmo-wallet/lib/src/communication';
import { sendToFirebase } from '../../../message/firebase-relay';
import { getProcess } from '../../../wallet/db/queries/walletProcess';
import { handleGameRequest } from '../../handlers/handle-game-request';
import { handleNewProcessAction } from '../../handlers/handle-new-process-action';
import { handleOngoingProcessAction } from '../../handlers/handle-ongoing-process-action';
export const BASE_URL = `/api/v1/channels`;

const router = new Router();

export function sendViaFirebaseToApplication(ctx) {
  const status = ctx.status;
  if (status === 200 || status === 201) {
    const to = ctx.body.commitment.channel.participants[0];
    const messagePayload = ctx.body;
    if (to && messagePayload) {
      sendToFirebase(to, { ...messagePayload, queue: 'GAME_ENGINE' });
    }
  }
}

export function sendViaFirebaseToWallet(ctx) {
  const status = ctx.status;
  if (status === 200 || status === 201) {
    const to = ctx.body.to;
    const payload = ctx.body.messagePayload;
    if (to && payload) {
      sendToFirebase(to, { payload, queue: 'WALLET' });
    }
  }
}

router.post(`${BASE_URL}`, koaBody(), async ctx => {
  const { queue } = ctx.request.body;
  if (queue === 'GAME_ENGINE') {
    const response = await handleGameRequest(ctx);
    sendViaFirebaseToApplication(response);
    return response;
  } else {
    const action = ctx.request.body;

    if (await isNewProcessAction(action)) {
      const response = await handleNewProcessAction(ctx);
      sendViaFirebaseToWallet(response);
      return response;
    } else if (await isProtocolAction(action)) {
      const response = await handleOngoingProcessAction(ctx);
      sendViaFirebaseToWallet(response);
      return response;
    }
  }
});

export const channelRoutes = router.routes();

function isNewProcessAction(action: RelayableAction): boolean {
  if (action.type === 'WALLET.NEW_PROCESS.CONCLUDE_INSTIGATED') {
    return true;
  } else {
    return false;
  }
}

async function isProtocolAction(action: RelayableAction): Promise<boolean> {
  if (
    action.type === 'WALLET.FUNDING.STRATEGY_PROPOSED' ||
    (action.type === 'WALLET.COMMON.COMMITMENT_RECEIVED' && !opensAppChannel(action)) ||
    (action.type === 'WALLET.COMMON.COMMITMENTS_RECEIVED' && !opensAppChannel(action))
  ) {
    const { processId } = action;
    const process = await getProcess(processId);
    if (!process) {
      throw new Error(`Process ${processId} is not running.`);
    }
    return true;
  }

  return false;
}

function opensAppChannel(action: RelayableAction): boolean {
  return false;
}