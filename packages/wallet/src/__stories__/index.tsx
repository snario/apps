import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import '../index.scss';
import { dummyWaitForLogin, dummyWaitForMetaMask } from './dummy-wallet-states';
import WalletContainer from '../containers/wallet';
import { initializedState } from './dummy-wallet-states';
import { ProtocolState } from '../redux/protocols';
import * as concludingScenarios from '../redux/protocols/concluding/instigator/__tests__/scenarios';
import * as defundingScenarios from '../redux/protocols/defunding/__tests__/scenarios';
import { isWithdrawalState } from '../redux/protocols/withdrawing/states';
const walletStateRender = state => () => {
  return (
    <Provider store={fakeStore(state)}>
      <WalletContainer position="center" />
    </Provider>
  );
};

export const protocolStateRender = (protocolState: ProtocolState) => {
  const walletState = {
    ...initializedState,
    processStore: {
      dummyProcessId: {
        processId: 'dummyProcessId',
        protocol: 0, // at the moment this is not used by containers
        protocolState: nestProtocolState(protocolState),
        channelsToMonitor: [],
      },
    },
    currentProcessId: 'dummyProcessId',
  };

  return walletStateRender(walletState);
};
function nestProtocolState(protocolState: ProtocolState): ProtocolState {
  if (isWithdrawalState(protocolState)) {
    const defundingState = {
      ...defundingScenarios.directlyFundingChannelHappyPath.waitForWithdrawal.state,
      withdrawalState: protocolState,
    };
    return { ...concludingScenarios.happyPath.waitForDefund.state, defundingState };
  } else {
    return protocolState;
  }
}
export function addStoriesFromScenario(scenario, chapter) {
  Object.keys(scenario).forEach(key => {
    if (scenario[key].state) {
      storiesOf(chapter, module).add(key, protocolStateRender(scenario[key].state));
    }
  });
}

const WalletScreensNotInitialized = {
  WaitForLogIn: dummyWaitForLogin,
  WaitForMetaMask: dummyWaitForMetaMask,
};

addStoriesFromCollection(WalletScreensNotInitialized, 'Not Initialized ');

const NetworkStatuses = {
  Mainnet: { ...dummyWaitForLogin, networkId: 1 },
  Kovan: { ...dummyWaitForLogin, networkId: 42 },
  Ropsten: { ...dummyWaitForLogin, networkId: 3 },
  Rinkeby: { ...dummyWaitForLogin, networkId: 4 },
  Ganache: { ...dummyWaitForLogin, networkId: 5777 },
};

addStoriesFromCollection(NetworkStatuses, 'Network Statuses');

storiesOf('Landing Page', module).add('Landing Page', walletStateRender({}));

export const fakeStore = state => ({
  dispatch: action => {
    alert(`Action ${action.type} triggered`);
    return action;
  },
  getState: () => state,
  subscribe: () => () => {
    /* empty */
  },
  replaceReducer: () => {
    /* empty */
  },
});

export function addStoriesFromCollection(collection, chapter, renderer = walletStateRender) {
  Object.keys(collection).map(storyName => {
    storiesOf(chapter, module).add(storyName, renderer(collection[storyName]));
  });
}
