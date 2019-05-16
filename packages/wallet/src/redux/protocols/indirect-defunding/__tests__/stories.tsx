import { storiesOf } from '@storybook/react';
import React from 'react';
import Modal from 'react-modal';
import { Provider } from 'react-redux';
import { fakeStore } from '../../../../__stories__/index';
import StatusBarLayout from '../../../../components/status-bar-layout';
import * as scenarios from './scenarios';
import { IndirectDefunding } from '../container';

const render = container => () => {
  // todo: rework this modal stuff
  return (
    <Provider store={fakeStore({})}>
      <Modal
        isOpen={true}
        className={'wallet-content-center'}
        overlayClassName={'wallet-overlay-center'}
        ariaHideApp={false}
      >
        <StatusBarLayout>{container}</StatusBarLayout>
      </Modal>
    </Provider>
  );
};

// Convention is to add all scenarios here, and allow the
// addStories function to govern what ends up being shown.
addStories(scenarios.playerAHappyPath, 'Indirect Defunding / PlayerA / Happy Path');

function addStories(scenario, chapter) {
  Object.keys(scenario).forEach(key => {
    if (scenario[key].state) {
      storiesOf(chapter, module).add(
        key,
        render(<IndirectDefunding state={scenario[key].state.state} />),
      );
    }
  });
}