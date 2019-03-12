/**
 * The term 'funding' is a bit overloaded here, as it is referring to the stage of the channel, as well as
 * the actual funding of the channel.
 */

import { ChannelOpen, channelOpen, UNKNOWN_FUNDING, UnknownFundingState } from '../shared';
import { FundingState } from './directFunding';

// stage
export const FUNDING = 'FUNDING';

// STATE TYPES
// Funding setup
export const WAIT_FOR_FUNDING_REQUEST = 'WAIT_FOR_FUNDING_REQUEST';
export const APPROVE_FUNDING = 'APPROVE_FUNDING';

// Funding ongoing
export const WAIT_FOR_FUNDING_AND_POST_FUND_SETUP = 'WAIT_FOR_FUNDING_AND_POST_FUND_SETUP';
export const WAIT_FOR_FUNDING_CONFIRMATION = 'WAIT_FOR_FUNDING_CONFIRMATION';
export const A_WAIT_FOR_POST_FUND_SETUP = 'A_WAIT_FOR_POST_FUND_SETUP';
export const B_WAIT_FOR_POST_FUND_SETUP = 'B_WAIT_FOR_POST_FUND_SETUP';

// Possible end states
export const ACKNOWLEDGE_FUNDING_SUCCESS = 'ACKNOWLEDGE_FUNDING_SUCCESS';
export const SEND_FUNDING_DECLINED_MESSAGE = 'SEND_FUNDING_DECLINED_MESSAGE';
export const ACKNOWLEDGE_FUNDING_DECLINED = 'ACKNOWLEDGE_FUNDING_DECLINED';

interface BaseFundingChannelState extends ChannelOpen {
  fundingState: FundingState;
  funded: boolean; // Though this is computable from fundingState, it might be convenient to record this on the top-level of the channel state
}

function fundingChannelState<T extends BaseFundingChannelState>(
  params: T,
): BaseFundingChannelState {
  const { fundingState, funded } = params;
  return { ...fundingChannelState(params), fundingState, funded };
}

// Since the funding request hasn't come in yet, it doesn't make sense for
// WaitForFundingRequest to have a fundingState. (What if the application wants
// to decide the funding mechanism?) Therefore, WaitForFundingRequest should
// probably extend ChannelOpen. However, so that the funding reducer can always
// reduce a state with a fundingState, we have to put an empty funding state here.
// TODO: Perhaps WaitForFundingRequest belongs in the OPENING stage.
export interface WaitForFundingRequest extends BaseFundingChannelState {
  type: typeof WAIT_FOR_FUNDING_REQUEST;
  stage: typeof FUNDING;
}

export interface ApproveFunding extends BaseFundingChannelState {
  type: typeof APPROVE_FUNDING;
  stage: typeof FUNDING;
}

export interface WaitForFundingAndPostFundSetup extends BaseFundingChannelState {
  type: typeof WAIT_FOR_FUNDING_AND_POST_FUND_SETUP;
  stage: typeof FUNDING;
}

export interface WaitForFundingConfirmation extends BaseFundingChannelState {
  type: typeof WAIT_FOR_FUNDING_CONFIRMATION;
  stage: typeof FUNDING;
}

export interface AWaitForPostFundSetup extends BaseFundingChannelState {
  type: typeof A_WAIT_FOR_POST_FUND_SETUP;
  stage: typeof FUNDING;
}

export interface BWaitForPostFundSetup extends BaseFundingChannelState {
  type: typeof B_WAIT_FOR_POST_FUND_SETUP;
  stage: typeof FUNDING;
}

export interface SendFundingDeclinedMessage extends BaseFundingChannelState {
  type: typeof SEND_FUNDING_DECLINED_MESSAGE;
  stage: typeof FUNDING;
}

export interface AcknowledgeFundingSuccess extends BaseFundingChannelState {
  type: typeof ACKNOWLEDGE_FUNDING_SUCCESS;
  stage: typeof FUNDING;
}

export interface AcknowledgeFundingDeclined extends BaseFundingChannelState {
  type: typeof ACKNOWLEDGE_FUNDING_DECLINED;
  stage: typeof FUNDING;
}

export function waitForFundingRequest<T extends ChannelOpen>(params: T): WaitForFundingRequest {
  return {
    type: WAIT_FOR_FUNDING_REQUEST,
    stage: FUNDING,
    ...channelOpen(params),
    fundingState: { fundingType: UNKNOWN_FUNDING },
    funded: false,
  };
}

export function approveFunding<T extends BaseFundingChannelState>(params: T): ApproveFunding {
  return {
    type: APPROVE_FUNDING,
    stage: FUNDING,
    ...fundingChannelState(params),
    fundingState: params.fundingState,
  };
}

export function waitForFundingAndPostFundSetup<T extends BaseFundingChannelState>(
  params: T,
): WaitForFundingAndPostFundSetup {
  return {
    type: WAIT_FOR_FUNDING_AND_POST_FUND_SETUP,
    stage: FUNDING,
    ...fundingChannelState(params),
  };
}

export function waitForFundingConfirmation<T extends BaseFundingChannelState>(
  params: T,
): WaitForFundingConfirmation {
  return { type: WAIT_FOR_FUNDING_CONFIRMATION, stage: FUNDING, ...fundingChannelState(params) };
}

export function aWaitForPostFundSetup<T extends BaseFundingChannelState>(
  params: T,
): AWaitForPostFundSetup {
  return { type: A_WAIT_FOR_POST_FUND_SETUP, stage: FUNDING, ...fundingChannelState(params) };
}

export function bWaitForPostFundSetup<T extends BaseFundingChannelState>(
  params: T,
): BWaitForPostFundSetup {
  return { type: B_WAIT_FOR_POST_FUND_SETUP, stage: FUNDING, ...fundingChannelState(params) };
}

export function acknowledgeFundingSuccess<T extends BaseFundingChannelState>(
  params: T,
): AcknowledgeFundingSuccess {
  return { type: ACKNOWLEDGE_FUNDING_SUCCESS, stage: FUNDING, ...fundingChannelState(params) };
}

export function sendFundingDeclinedMessage<T extends BaseFundingChannelState>(
  params: T,
): SendFundingDeclinedMessage {
  return { type: SEND_FUNDING_DECLINED_MESSAGE, stage: FUNDING, ...fundingChannelState(params) };
}

export function acknowledgeFundingDeclined<T extends BaseFundingChannelState>(
  params: T,
): AcknowledgeFundingDeclined {
  return { type: ACKNOWLEDGE_FUNDING_DECLINED, stage: FUNDING, ...fundingChannelState(params) };
}

export type FundingChannelState =
  | WaitForFundingRequest
  | ApproveFunding
  | WaitForFundingAndPostFundSetup
  | WaitForFundingConfirmation
  | AWaitForPostFundSetup
  | BWaitForPostFundSetup
  | AcknowledgeFundingSuccess
  | SendFundingDeclinedMessage
  | AcknowledgeFundingDeclined;
