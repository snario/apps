import Web3 from 'web3';

import Message from './Message';

export default class ChannelWallet {
  account: any; // todo: figure out how to do types with web3

  constructor() {
    const web3 = new Web3('');
    this.account = web3.eth.accounts.create();
  }

  get address() {
    return this.account.address;
  }

  get privateKey() {
    return this.account.privateKey;
  }

  sign(stateString: string) {
    const { signature } = this.account.sign(stateString);
    return new Message(stateString, signature);
  }
}