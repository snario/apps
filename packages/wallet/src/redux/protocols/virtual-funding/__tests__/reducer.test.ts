import * as states from '../states';
import { initialize, reducer } from '../reducer';
import * as scenarios from './scenarios';
import {
  scenarioStepDescription,
  itSendsTheseCommitments,
  itSendsNoMessage,
} from '../../../__tests__/helpers';
import { success, preSuccess } from '../../advance-channel/__tests__';
import { twoThreeFive } from '../../../__tests__/test-scenarios';

const itTransitionsTo = (
  result: states.VirtualFundingState,
  type: states.VirtualFundingStateType,
) => {
  it(`transitions to ${type}`, () => {
    expect(result.type).toEqual(type);
  });
};

const itTransitionsSubstateTo = (
  result: any,
  substate: states.SubstateDescriptor,
  type: string,
) => {
  it(`transitions to ${type}`, () => {
    expect(result[substate].type).toEqual(type);
  });
};

describe('happyPath', () => {
  const scenario = scenarios.happyPath;

  describe.only('Initialization', () => {
    const { startingDestination, hubAddress } = scenario;
    const { sharedData, args } = scenario.initialize;
    const { protocolState, sharedData: result } = initialize(sharedData, args);

    itTransitionsTo(protocolState, 'VirtualFunding.WaitForJointChannel');
    itSendsTheseCommitments(result, [
      {
        commitment: {
          turnNum: 0,
          allocation: twoThreeFive,
          destination: [...startingDestination, hubAddress],
        },
      },
    ]);
  });

  describe.only(scenarioStepDescription(scenario.openJ), () => {
    const { state, sharedData, action } = scenario.openJ;
    const { protocolState } = reducer(state, sharedData, action);

    itTransitionsTo(protocolState, 'VirtualFunding.WaitForJointChannel');
    itTransitionsSubstateTo(protocolState, 'jointChannel', preSuccess.state.type);
  });

  describe.only(scenarioStepDescription(scenario.prepareJ), () => {
    const { state, sharedData, action } = scenario.prepareJ;
    const { protocolState } = reducer(state, sharedData, action);

    itTransitionsTo(protocolState, 'VirtualFunding.WaitForGuarantorChannel');
    itTransitionsSubstateTo(protocolState, 'guarantorChannel', preSuccess.state.type);
  });

  describe(scenarioStepDescription(scenario.openG), () => {
    const { state, sharedData, action } = scenario.openG;
    const { protocolState, sharedData: result } = reducer(state, sharedData, action);

    itTransitionsTo(protocolState, 'VirtualFunding.WaitForGuarantorChannel');
    itTransitionsSubstateTo(protocolState, 'guarantorChannel', preSuccess.state.type);
    itSendsNoMessage(result);
  });

  describe(scenarioStepDescription(scenario.prepareG), () => {
    const { state, sharedData, action } = scenario.prepareG;
    const { protocolState, sharedData: result } = reducer(state, sharedData, action);

    itTransitionsTo(protocolState, 'VirtualFunding.WaitForGuarantorFunding');
    itTransitionsSubstateTo(protocolState, 'indirectGuarantorFunding', success.state.type);
    itSendsNoMessage(result);
  });
});
